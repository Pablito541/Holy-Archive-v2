'use client';

import React, { useState, useEffect } from 'react';
import { Item } from '../../types';
import { generateId } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

// Views
import { LoginView } from '../../components/views/LoginView';
import { DashboardView } from '../../components/views/DashboardView';
import { InventoryView } from '../../components/views/InventoryView';
import { AddItemView } from '../../components/views/AddItemView';
import { SellItemView } from '../../components/views/SellItemView';
import { ItemDetailView } from '../../components/views/ItemDetailView';
import { ExportView } from '../../components/views/ExportView';
import { ActionMenu } from '../../components/views/ActionMenu';
import { Navigation } from '../../components/views/Navigation';
import { useToast } from '../../components/ui/Toast';

const PAGE_SIZE = 50;

interface DashboardClientProps {
    initialUser: any;
    initialOrgId: string | null;
    initialItems: Item[];
}

export default function DashboardClient({ initialUser, initialOrgId, initialItems }: DashboardClientProps) {
    const [user, setUser] = useState<any>(initialUser);
    const [view, setView] = useState(initialUser ? 'dashboard' : 'login');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'view' | 'sell'>('view');

    const [items, setItems] = useState<Item[]>(initialItems);
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [orgId, setOrgId] = useState<string | null>(initialOrgId);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    const { showToast } = useToast();

    // 1. Auth & Data Loading
    useEffect(() => {
        if (!supabase) return;

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            console.log('DashboardClient: Auth state change:', _event, currentUser?.email);
            setUser(currentUser);

            if (currentUser) {
                // Determine the view immediately
                setView(prev => prev === 'login' ? 'dashboard' : prev);

                // Fetch org membership in parallel
                if (supabase) {
                    supabase
                        .from('organization_members')
                        .select('organization_id')
                        .eq('user_id', currentUser.id)
                        .maybeSingle()
                        .then(({ data: member, error }) => {
                            if (error) {
                                console.error("DashboardClient: Error fetching organization membership:", error);
                            }
                            if (member) {
                                setOrgId(member.organization_id);
                            } else {
                                console.log("DashboardClient: No organization membership found for user.");
                            }
                        });
                }
            } else {
                setOrgId(null);
                setView('login');
            }
        });

        return () => subscription.unsubscribe();
    }, []); // Run only once

    const fetchStats = async () => {
        // Redundant if DashboardView fetches its own stats, but useful for other views if needed
        // For now preventing errors
        if (!supabase || !orgId) return;
    };

    const loadData = async (pageToLoad: number = 0, reset: boolean = false) => {
        if (!supabase || !user || !orgId) return;

        setIsLoading(true);
        try {
            // Fetch stats if it's a reset (initial or refresh)
            if (reset) {
                fetchStats();
            }

            const from = pageToLoad * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            // Include count in the query
            const { data, error, count } = await supabase
                .from('items')
                .select('*', { count: 'exact' })
                .eq('organization_id', orgId)
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

                // Update total count if available
                if (count !== null) {
                    setTotalCount(count);
                }

                if (reset) {
                    setItems(mappedItems);
                    // If we reset, hasMore is true if we have fewer items than total
                    setHasMore(mappedItems.length < (count || 0));
                } else {
                    setItems(prev => {
                        const newItems = [...prev, ...mappedItems];
                        // Correctly set hasMore based on total count
                        setHasMore(newItems.length < (count || totalCount));
                        return newItems;
                    });
                }

                // Fallback for hasMore if count logic fails (e.g. RLS preventing count)
                if (count === null) {
                    setHasMore(data.length === PAGE_SIZE);
                }
            }
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch stats and items on mount/login
    useEffect(() => {
        if (user && orgId) {
            fetchStats(); // Always fetch fresh global stats

            // Only fetch items if we don't have them yet (initial load fallback)
            if (items.length === 0) {
                loadData(0, true);
            }
        }
    }, [user, orgId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadData(nextPage, false);
    };

    const handleCreateItem = async (data: Partial<Item>) => {
        try {
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
                    fetchStats();
                    showToast('Artikel erfolgreich erstellt', 'success');
                }
            }

            setView('inventory');
            setSelectionMode('view');
        } catch (e: any) {
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

                const { error } = await supabase.from('items').update(dbUpdate).eq('id', id);
                if (error) throw error;
            }

            setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
            fetchStats();
            showToast('Artikel aktualisiert', 'success');
            setView('item-detail');
        } catch (e: any) {
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

            setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'sold', ...saleData } : item));
            fetchStats();
            showToast('Artikel als verkauft markiert', 'success');
            setView('inventory');
            setSelectionMode('view');
        } catch (e) {
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
            fetchStats();
            showToast('Artikel gelöscht', 'success');
            setView('inventory');
        } catch (e) {
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

            setItems(prev => prev.map(item => item.id === id ? {
                ...item,
                status: 'reserved',
                reservedFor: name,
                reservedUntil: reservedUntil.toISOString()
            } : item));
            showToast('Artikel reserviert', 'success');
        } catch (e) {
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

            setItems(prev => prev.map(item => item.id === id ? {
                ...item,
                status: 'in_stock',
                reservedFor: undefined,
                reservedUntil: undefined
            } : item));
            showToast('Reservierung aufgehoben', 'success');
        } catch (e) {
            showToast('Fehler beim Aufheben der Reservierung', 'error');
        }
    };

    const handleLogout = async () => {
        if (supabase) await supabase.auth.signOut();
        setUser(null);
        setView('login');
    };

    const renderContent = () => {
        if (view === 'login') return <LoginView onLogin={(u) => { setUser(u); setView('dashboard'); }} />;

        if (view === 'dashboard') return (
            <DashboardView
                items={items}
                onViewInventory={() => setView('inventory')}
                onAddItem={() => setView('add-item')}
                userEmail={user?.email}
                onLogout={handleLogout}
                onRefresh={() => loadData(0, true)}
                serverStats={dashboardStats}
                currentUser={user}
                currentOrgId={orgId}
            />
        );

        if (view === 'inventory') return (
            <InventoryView
                items={items}
                onSelectItem={(id) => { setSelectedItemId(id); setView('item-detail'); }}
                selectionMode={selectionMode}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                onRefresh={() => loadData(0, true)}
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
        <div className="min-h-screen font-sans text-stone-900 dark:text-zinc-50 pb-20">
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
