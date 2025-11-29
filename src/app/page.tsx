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
import { ToastProvider, useToast } from '../components/ui/Toast';

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('login');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'view' | 'sell'>('view');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // 1. Auth State Listener
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('dashboard');
        loadData(session.user.id);
      } else {
        setView('login');
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView('dashboard');
        loadData(session.user.id);
      } else {
        setView('login');
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Laden der Daten
  async function loadData(userId: string) {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
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
        setItems(mappedItems);
      }
    } catch (error: any) {
      console.error('Error loading items:', error);
      showToast('Fehler beim Laden der Daten', 'error');
    }
  }

  // 3. Speichern / Update Logik
  const handleCreateItem = async (data: Partial<Item>) => {
    if (!user || !supabase) return;

    // DB Format
    const dbItem = {
      user_id: user.id, // WICHTIG: User Ownership
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

    try {
      const { data: inserted, error } = await supabase.from('items').insert(dbItem).select().single();

      if (error) throw error;

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
        showToast('Artikel erfolgreich angelegt', 'success');
        setView('inventory');
        setSelectionMode('view');
      }
    } catch (error: any) {
      console.error('Error creating item:', error);
      showToast('Fehler beim Erstellen: ' + error.message, 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!supabase) return;

    if (confirm('Wirklich löschen?')) {
      try {
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) throw error;

        const newItems = items.filter(i => i.id !== id);
        setItems(newItems);
        showToast('Artikel gelöscht', 'info');
        setView('inventory');
      } catch (error: any) {
        console.error('Error deleting item:', error);
        showToast('Fehler beim Löschen', 'error');
      }
    }
  };

  const handleSellItem = async (saleData: Partial<Item>) => {
    if (!selectedItemId || !supabase) return;

    const dbUpdate = {
      status: 'sold',
      sale_price_eur: saleData.salePriceEur,
      sale_date: saleData.saleDate,
      sale_channel: saleData.saleChannel,
      platform_fees_eur: saleData.platformFeesEur,
      shipping_cost_eur: saleData.shippingCostEur,
      reserved_for: null,
      reserved_until: null
    };

    try {
      const { error } = await supabase.from('items').update(dbUpdate).eq('id', selectedItemId);
      if (error) throw error;

      setItems(prev => prev.map(item => {
        if (item.id === selectedItemId) {
          return {
            ...item,
            ...saleData,
            status: 'sold',
            reservedFor: undefined,
            reservedUntil: undefined
          };
        }
        return item;
      }));

      showToast('Artikel verkauft!', 'success');
      setView('dashboard');
    } catch (error: any) {
      console.error('Error selling item:', error);
      showToast('Fehler beim Verkauf: ' + (error.message || error.error_description || JSON.stringify(error)), 'error');
    }
  };

  const handleReserveItem = async (id: string, name: string, days: number) => {
    if (!supabase) return;

    const until = new Date();
    until.setDate(until.getDate() + days);
    const isoDate = until.toISOString();

    try {
      const { error } = await supabase.from('items').update({
        status: 'reserved',
        reserved_for: name,
        reserved_until: isoDate
      }).eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'reserved',
            reservedFor: name,
            reservedUntil: isoDate
          };
        }
        return item;
      }));
      showToast('Artikel reserviert', 'info');
    } catch (error: any) {
      console.error('Error reserving item:', error);
      showToast('Fehler beim Reservieren: ' + (error.message || error.error_description || JSON.stringify(error)), 'error');
    }
  };

  const handleAction = (action: 'buy' | 'sell') => {
    setShowActionMenu(false);
    if (action === 'buy') {
      setView('add');
    } else {
      setSelectionMode('sell');
      setView('inventory');
    }
  };

  useEffect(() => {
    if (view !== 'inventory' && view !== 'detail' && view !== 'sell') {
      setSelectionMode('view');
    }
  }, [view]);

  let content;
  const showNav = ['dashboard', 'inventory', 'export'].includes(view) && !!user;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div></div>;
  }

  if (!user) return <LoginView onLogin={() => { }} />; // onLogin handled by auth state listener

  switch (view) {
    case 'dashboard': content = <DashboardView items={items} />; break;
    case 'inventory':
      content = <InventoryView
        items={items}
        selectionMode={selectionMode}
        onSelectItem={(id) => {
          setSelectedItemId(id);
          if (selectionMode === 'sell') {
            setView('sell');
          } else {
            setView('detail');
          }
        }}
      />;
      break;
    case 'add': content = <AddItemView onSave={handleCreateItem} onCancel={() => setView('inventory')} />; break;
    case 'detail':
      const selectedItem = items.find(i => i.id === selectedItemId);
      content = selectedItem ? (
        <ItemDetailView
          item={selectedItem}
          onBack={() => setView('inventory')}
          onSell={() => setView('sell')}
          onDelete={() => handleDeleteItem(selectedItem.id)}
          onReserve={handleReserveItem}
        />
      ) : null;
      break;
    case 'sell':
      const itemToSell = items.find(i => i.id === selectedItemId);
      content = itemToSell ? <SellItemView item={itemToSell} onSave={handleSellItem} onCancel={() => {
        if (selectionMode === 'sell') {
          setView('inventory');
        } else {
          setView('detail');
        }
      }} /> : null;
      break;
    case 'export': content = <ExportView items={items} />; break;
    default: content = <DashboardView items={items} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fafaf9] shadow-2xl relative">
      {content}
      {showNav && <Navigation currentView={view} setView={setView} onOpenAction={() => setShowActionMenu(true)} />}
      {showActionMenu && <ActionMenu onClose={() => setShowActionMenu(false)} onAction={handleAction} />}
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}