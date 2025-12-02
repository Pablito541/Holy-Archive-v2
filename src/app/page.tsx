'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '../types';
import { generateId } from '../lib/utils';
import { supabase } from '../lib/supabase';

// Views
import { LoginView } from '../components/views/LoginView';
import { DashboardView } from '../components/views/DashboardView';
import { InventoryView } from '../components/views/InventoryView';
import { AddItemView } from '../components/views/AddItemView';
import { SellItemView } from '../components/views/SellItemView';
import { ItemDetailView } from '../components/views/ItemDetailView';
import { ExportView } from '../components/views/ExportView';
import { ActionMenu } from '../components/views/ActionMenu';
import { Navigation } from '../components/views/Navigation';
import { useToast } from '../components/ui/Toast';

const PAGE_SIZE = 50;

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('login');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'view' | 'sell'>('view');

  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Auth & Data Loading
  useEffect(() => {
    // Check active session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) setView('dashboard');
      });

      // Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user && view === 'login') setView('dashboard');
        else if (!session?.user) setView('login');
      });

      return () => subscription.unsubscribe();
    } else {
      // Dev mode without Supabase
      const savedUser = localStorage.getItem('holy_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setView('dashboard');
      }
    }
  }, []);

  const loadData = async (pageToLoad: number = 0, reset: boolean = false) => {
    if (!supabase || !user) return;

    setIsLoading(true);
    try {
      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data && !error) {
        const mappedItems: Item[] = data.map((d: any) => ({
          id: d.id,
          brand: d.brand,
          model: d.model,
          category: d.category,
          condition: d.condition,
          status: d.status,
          purchasePriceEur: d.purchase_price_eur,
          purchaseDate: d.purchase_date,
          purchaseSource: d.purchase_source,
          salePriceEur: d.sale_price_eur,
          saleDate: d.sale_date,
          saleChannel: d.sale_channel,
          platformFeesEur: d.platform_fees_eur,
          shippingCostEur: d.shipping_cost_eur,
          reservedFor: d.reserved_for,
          reservedUntil: d.reserved_until,
          imageUrls: d.image_urls || [],
          notes: d.notes,
          createdAt: d.created_at
        }));

        if (reset) {
          setItems(mappedItems);
        } else {
          setItems(prev => [...prev, ...mappedItems]);
        }

        setHasMore(mappedItems.length === PAGE_SIZE);
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData(0, true);
    } else {
      // Lade von LocalStorage fallback
      try {
        const saved = localStorage.getItem('vintage_items');
        if (saved) setItems(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, [user]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, false);
  };

  // 2. Speichern / Update Logik
  const { showToast } = useToast();

  const handleCreateItem = async (data: Partial<Item>) => {
    try {
      // DB Format
      const dbItem = {
        user_id: user?.id,
        brand: data.brand || 'Unknown',
        model: data.model || '',
        category: data.category || 'bag',
        condition: data.condition || 'good',
        status: 'in_stock',
        purchase_price_eur: data.purchasePriceEur || 0,
        purchase_date: data.purchaseDate || new Date().toISOString(),
        purchase_source: data.purchaseSource || '',
        image_urls: data.imageUrls || [],
        notes: data.notes || ''
      };

      if (supabase) {
        const { data: inserted, error } = await supabase.from('items').insert(dbItem).select().single();

        if (error) {
          console.error('Supabase Error:', error);
          showToast(`Fehler beim Erstellen: ${error.message}`, 'error');
          return;
        }

        if (inserted) {
          const newItem: Item = {
            id: inserted.id,
            brand: inserted.brand,
            model: inserted.model,
            category: inserted.category,
            condition: inserted.condition,
            status: inserted.status,
            purchasePriceEur: inserted.purchase_price_eur,
            purchaseDate: inserted.purchase_date,
            purchaseSource: inserted.purchase_source,
            salePriceEur: inserted.sale_price_eur,
            saleDate: inserted.sale_date,
            saleChannel: inserted.sale_channel,
            platformFeesEur: inserted.platform_fees_eur,
            shippingCostEur: inserted.shipping_cost_eur,
            reservedFor: inserted.reserved_for,
            reservedUntil: inserted.reserved_until,
            imageUrls: inserted.image_urls || [],
            notes: inserted.notes,
            createdAt: inserted.created_at
          };
          setItems(prev => [newItem, ...prev]);
          showToast('Artikel erfolgreich erstellt', 'success');
        }
      } else {
        // Local Fallback
        const newItem: Item = {
          ...data,
          id: generateId(),
          status: 'in_stock',
          createdAt: new Date().toISOString()
        } as Item;
        setItems(prev => [newItem, ...prev]);
        localStorage.setItem('vintage_items', JSON.stringify([newItem, ...items]));
        showToast('Artikel lokal gespeichert', 'success');
      }

      setView('inventory');
      setSelectionMode('view');
    } catch (e: any) {
      console.error('Create Error:', e);
      showToast('Ein unerwarteter Fehler ist aufgetreten', 'error');
    }
  };

  const handleUpdateItem = async (id: string, data: Partial<Item>) => {
    try {
      if (supabase) {
        const dbUpdate = {
          brand: data.brand,
          model: data.model,
          category: data.category,
          condition: data.condition,
          purchase_price_eur: data.purchasePriceEur,
          purchase_date: data.purchaseDate,
          purchase_source: data.purchaseSource,
          image_urls: data.imageUrls,
          notes: data.notes
        };

        const { error } = await supabase
          .from('items')
          .update(dbUpdate)
          .eq('id', id);

        if (error) throw error;
      }

      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, ...data } : item
      ));

      showToast('Artikel aktualisiert', 'success');
      setView('item-detail');
    } catch (e: any) {
      console.error('Update Error:', e);
      showToast('Fehler beim Aktualisieren', 'error');
    }
  };

  const handleSellItem = async (id: string, saleData: any) => {
    try {
      if (supabase) {
        const { error } = await supabase.from('items').update({
          status: 'sold',
          sale_price_eur: saleData.salePriceEur,
          sale_date: saleData.saleDate,
          sale_channel: saleData.saleChannel,
          platform_fees_eur: saleData.platformFeesEur,
          shipping_cost_eur: saleData.shippingCostEur
        }).eq('id', id);

        if (error) throw error;
      }

      setItems(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'sold',
            ...saleData
          };
        }
        return item;
      }));
      showToast('Artikel als verkauft markiert', 'success');
      setView('inventory');
      setSelectionMode('view');
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Verkauf', 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      if (supabase) {
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) throw error;
      }
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('Artikel gelöscht', 'success');
      setView('inventory');
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Löschen', 'error');
    }
  };

  const handleReserveItem = async (id: string, name: string, days: number) => {
    try {
      const reservedUntil = new Date();
      reservedUntil.setDate(reservedUntil.getDate() + days);

      if (supabase) {
        const { error } = await supabase.from('items').update({
          status: 'reserved',
          reserved_for: name,
          reserved_until: reservedUntil.toISOString()
        }).eq('id', id);
        if (error) throw error;
      }

      setItems(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'reserved',
            reservedFor: name,
            reservedUntil: reservedUntil.toISOString()
          };
        }
        return item;
      }));
      showToast('Artikel reserviert', 'success');
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Reservieren', 'error');
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      if (supabase) {
        const { error } = await supabase.from('items').update({
          status: 'in_stock',
          reserved_for: null,
          reserved_until: null
        }).eq('id', id);
        if (error) throw error;
      }

      setItems(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'in_stock',
            reservedFor: undefined,
            reservedUntil: undefined
          };
        }
        return item;
      }));
      showToast('Reservierung aufgehoben', 'success');
    } catch (e) {
      console.error(e);
      showToast('Fehler beim Aufheben der Reservierung', 'error');
    }
  };

  const renderContent = () => {
    if (view === 'login') return <LoginView onLogin={(u) => { setUser(u); setView('dashboard'); }} />;

    if (view === 'dashboard') return (
      <DashboardView
        items={items}
        onViewInventory={() => setView('inventory')}
        onAddItem={() => setView('add-item')}
      />
    );

    if (view === 'inventory') return (
      <InventoryView
        items={items}
        onSelectItem={(id) => { setSelectedItemId(id); setView('item-detail'); }}
        selectionMode={selectionMode}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    );

    if (view === 'add-item') return (
      <AddItemView
        onSave={handleCreateItem}
        onCancel={() => setView('dashboard')}
      />
    );

    if (view === 'edit-item' && selectedItemId) {
      const itemToEdit = items.find(i => i.id === selectedItemId);
      if (!itemToEdit) return null;
      return (
        <AddItemView
          initialData={itemToEdit}
          onSave={(data) => handleUpdateItem(selectedItemId, data)}
          onCancel={() => setView('item-detail')}
        />
      );
    }

    if (view === 'sell-item' && selectedItemId) {
      const itemToSell = items.find(i => i.id === selectedItemId);
      if (!itemToSell) return null;
      return (
        <SellItemView
          item={itemToSell}
          onConfirm={(data) => handleSellItem(selectedItemId, data)}
          onCancel={() => setView('item-detail')}
        />
      );
    }

    if (view === 'item-detail' && selectedItemId) {
      const item = items.find(i => i.id === selectedItemId);
      if (!item) return null;
      return (
        <ItemDetailView
          item={item}
          onBack={() => setView('inventory')}
          onSell={() => setView('sell-item')}
          onDelete={() => handleDeleteItem(selectedItemId)}
          onReserve={handleReserveItem}
          onCancelReservation={() => handleCancelReservation(selectedItemId)}
          onEdit={() => setView('edit-item')}
        />
      );
    }

    if (view === 'export') return <ExportView items={items} />;

    return null;
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] font-sans text-stone-900 pb-20">
      {renderContent()}

      {view !== 'login' && (
        <Navigation
          currentView={view}
          onNavigate={(v) => {
            if (v === 'add-item') {
              setShowActionMenu(true);
            } else {
              setView(v);
              setSelectionMode('view');
            }
          }}
        />
      )}

      {showActionMenu && (
        <ActionMenu
          onClose={() => setShowActionMenu(false)}
          onAddItem={() => { setShowActionMenu(false); setView('add-item'); }}
          onSellItem={() => { setShowActionMenu(false); setView('inventory'); setSelectionMode('sell'); }}
        />
      )}
    </div>
  );
}