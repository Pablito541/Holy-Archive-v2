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

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('login');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'view' | 'sell'>('view');

  const [items, setItems] = useState<Item[]>([]);

  // 1. Laden der Daten (Hybrid: Supabase oder LocalStorage)
  useEffect(() => {
    async function loadData() {
      if (supabase) {
        // Lade von DB
        const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
        if (data && !error) {
          // Mappe DB-Felder auf unser Interface (CamelCase conversion falls nötig, hier sind die DB Felder im SQL snake_case)
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
      } else {
        // Lade von LocalStorage
        try {
          const saved = localStorage.getItem('vintage_items');
          if (saved) setItems(JSON.parse(saved));
        } catch (e) { console.error(e); }
      }
    }
    loadData();
  }, []);

  // 2. Speichern / Update Logik
  const { showToast } = useToast();

  // ...

  const handleCreateItem = async (data: Partial<Item>) => {
    try {
      // DB Format
      const dbItem = {
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

  const handleDeleteItem = async (id: string) => {
    if (confirm('Wirklich löschen?')) {
      if (supabase) {
        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) {
          showToast(`Fehler beim Löschen: ${error.message}`, 'error');
          return;
        }
      }
      const newItems = items.filter(i => i.id !== id);
      setItems(newItems);
      if (!supabase) localStorage.setItem('vintage_items', JSON.stringify(newItems));
      setView('inventory');
      showToast('Artikel gelöscht', 'info');
    }
  };

  const handleSellItem = async (saleData: Partial<Item>) => {
    if (!selectedItemId) return;

    try {
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

      if (supabase) {
        const { error } = await supabase.from('items').update(dbUpdate).eq('id', selectedItemId);
        if (error) {
          console.error('Supabase Update Error:', error);
          showToast(`Fehler beim Verkauf: ${error.message}`, 'error');
          return;
        }
      }

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

      if (!supabase) {
        // update local storage logic omitted
      }

      setView('dashboard');
      showToast('Artikel erfolgreich verkauft!', 'success');
    } catch (e) {
      console.error('Sell Error:', e);
      showToast('Fehler beim Speichern des Verkaufs', 'error');
    }
  };

  const handleReserveItem = async (id: string, name: string, days: number) => {
    try {
      const until = new Date();
      until.setDate(until.getDate() + days);
      const isoDate = until.toISOString();

      if (supabase) {
        const { error } = await supabase.from('items').update({
          status: 'reserved',
          reserved_for: name,
          reserved_until: isoDate
        }).eq('id', id);

        if (error) {
          console.error('Reserve Error:', error);
          showToast(`Fehler beim Reservieren: ${error.message}`, 'error');
          return;
        }
      }

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

      showToast(`Artikel für ${name} reserviert`, 'success');
    } catch (e) {
      console.error('Reserve Error:', e);
      showToast('Fehler beim Reservieren', 'error');
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
  const showNav = ['dashboard', 'inventory', 'export'].includes(view);

  if (!user) return <LoginView onLogin={() => { setUser({ name: 'Admin' }); setView('dashboard'); }} />;

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