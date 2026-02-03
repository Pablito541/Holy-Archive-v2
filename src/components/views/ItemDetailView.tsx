import React, { useState } from 'react';
import { X, ArrowLeft, ZoomIn, Clock, Trash2, ShoppingBag, Edit2, Share2 } from 'lucide-react';
import { Item, Condition } from '../../types';
import { calculateProfit, formatCurrency, formatDate, conditionLabels } from '../../lib/utils';
import { FadeIn } from '../ui/FadeIn';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { StatusBadge } from '../ui/StatusBadge';

export const ItemDetailView = ({ item, onBack, onSell, onDelete, onReserve, onCancelReservation, onEdit }: {
    item: Item,
    onBack: () => void,
    onSell: () => void,
    onDelete: () => void,
    onReserve: (id: string, name: string, days: number) => void,
    onCancelReservation?: () => void,
    onEdit?: () => void
}) => {
    const profit = calculateProfit(item);
    const roi = item.purchasePriceEur ? ((profit || 0) / item.purchasePriceEur) * 100 : 0;
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [isReserving, setIsReserving] = useState(false);

    const [reservationName, setReservationName] = useState('');
    const [reservationDays, setReservationDays] = useState(7);

    const handleReserve = () => {
        onReserve(item.id, reservationName, reservationDays);
        setIsReserving(false);
    };

    return (
        <FadeIn className="bg-white dark:bg-zinc-950 min-h-screen pb-safe relative">
            {isImageOpen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsImageOpen(false)}>
                    <button className="absolute top-6 right-6 text-white p-2 bg-white/20 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                    {item.imageUrls && item.imageUrls[0] && (
                        <img src={item.imageUrls[0]} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                    )}
                </div>
            )}

            {isReserving && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={() => setIsReserving(false)}></div>
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                        <h3 className="font-serif font-bold text-2xl mb-2 text-stone-900 dark:text-white">Artikel reservieren</h3>
                        <Input
                            label="Reserviert für (Name)"
                            placeholder="z.B. Max Mustermann"
                            value={reservationName}
                            onChange={(e: any) => setReservationName(e.target.value)}
                            autoFocus
                        />
                        <Input
                            label="Dauer (Tage)"
                            type="number"
                            value={reservationDays}
                            onChange={(e: any) => setReservationDays(parseInt(e.target.value))}
                        />
                        <div className="flex gap-3 pt-2">
                            <Button onClick={() => setIsReserving(false)} variant="secondary" className="flex-1">Abbrechen</Button>
                            <Button onClick={handleReserve} variant="primary" className="flex-1">Speichern</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative h-[40vh] bg-stone-100 dark:bg-zinc-900 group cursor-zoom-in" onClick={() => setIsImageOpen(true)}>
                {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img src={item.imageUrls[0]} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-300 dark:text-zinc-700">
                        <ShoppingBag className="w-20 h-20 opacity-30 mb-4" />
                        <span className="font-serif text-lg">Kein Bild vorhanden</span>
                    </div>
                )}

                <header className="px-6 py-6 flex items-center justify-between sticky top-0 z-20 pointer-events-none">
                    <button onClick={onBack} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-100 text-stone-600 active:scale-90 transition-transform pointer-events-auto">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2 pointer-events-auto">
                        {onEdit && (
                            <button onClick={onEdit} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-stone-100 text-stone-600 active:scale-90 transition-transform">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </header>
                <div className="absolute bottom-12 right-6 bg-black/40 text-white px-2 py-1 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="w-4 h-4" />
                </div>
            </div>

            <div className="px-8 py-10 -mt-10 bg-white dark:bg-zinc-950 rounded-t-[2.5rem] relative z-0 space-y-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">

                <div className="text-center">
                    <h2 className="text-4xl font-serif font-bold text-stone-900 dark:text-white mb-2">{item.brand}</h2>
                    <p className="text-lg text-stone-500 dark:text-zinc-400 font-light">{item.model || item.category}</p>
                </div>

                {item.status === 'sold' && (
                    <div className="p-6 bg-stone-900 dark:bg-zinc-800 text-stone-50 dark:text-white rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4 opacity-80 text-sm">
                                <span>Verkauf am {formatDate(item.saleDate || '')}</span>
                                <span>{item.saleChannel}</span>
                            </div>
                            <div className="flex justify-between items-end border-t border-white/20 pt-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Reingewinn</span>
                                <div className="text-right">
                                    <span className="block text-3xl font-serif">{formatCurrency(profit || 0)}</span>
                                    <span className="text-sm font-bold text-emerald-400">{roi.toFixed(0)}% ROI</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {item.status === 'reserved' && (
                    <div className="p-6 bg-amber-50 text-amber-900 rounded-3xl border border-amber-100">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start">
                                <Clock className="w-5 h-5 mr-2 text-amber-600" />
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Reserviert</h4>
                                    <p className="text-sm opacity-80">Für: {item.reservedFor}</p>
                                    <p className="text-xs opacity-60 mt-1">Bis: {formatDate(item.reservedUntil || '')}</p>
                                </div>
                            </div>
                            <Button
                                onClick={onCancelReservation}
                                variant="ghost"
                                className="text-amber-700 hover:bg-amber-100 -mt-2 -mr-2 text-xs px-3 py-2 h-auto"
                            >
                                Aufheben
                            </Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-stone-50 dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Einkaufspreis</p>
                        <p className="font-mono text-lg font-semibold text-stone-900 dark:text-white">{formatCurrency(item.purchasePriceEur)}</p>
                    </div>
                    <div className="p-5 bg-stone-50 dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Quelle</p>
                        <p className="font-medium text-stone-900 dark:text-white truncate">{item.purchaseSource}</p>
                    </div>
                    <div className="p-5 bg-stone-50 dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Zustand</p>
                        <p className="font-medium capitalize text-stone-900 dark:text-white">{conditionLabels[item.condition as Condition] || item.condition}</p>
                    </div>
                    <div className="p-5 bg-stone-50 dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800">
                        <p className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-1">Kaufdatum</p>
                        <p className="font-medium text-stone-900 dark:text-white">{formatDate(item.purchaseDate)}</p>
                    </div>
                </div>

                {item.notes && (
                    <div>
                        <h3 className="text-xs font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest mb-3 ml-1">Notizen</h3>
                        <p className="text-stone-600 dark:text-zinc-400 text-sm leading-relaxed bg-stone-50 dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800">
                            {item.notes}
                        </p>
                    </div>
                )}

                <div className="pt-4 space-y-4 pb-12">
                    {item.status !== 'sold' && (
                        <div className="flex gap-3">
                            {item.status === 'in_stock' && (
                                <Button onClick={() => setIsReserving(true)} variant="amber" className="flex-1">
                                    Reservieren
                                </Button>
                            )}
                            <Button onClick={onSell} className="flex-1 shadow-xl shadow-stone-900/20">
                                Verkauf erfassen
                            </Button>
                        </div>
                    )}

                    <Button onClick={onDelete} variant="ghost" className="w-full text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Artikel aus Datenbank löschen
                    </Button>
                </div>
            </div>
        </FadeIn>
    );
};
