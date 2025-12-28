import React from 'react';
import { TrendingUp, Package, Plus, Download } from 'lucide-react';

export const Navigation = ({ currentView, onNavigate }: { currentView: string, onNavigate: (view: string) => void }) => {
    const tabs = [
        { id: 'dashboard', icon: TrendingUp, label: 'Home' },
        { id: 'inventory', icon: Package, label: 'Lager' },
        { id: 'action', icon: Plus, label: 'Neu', special: true },
        { id: 'export', icon: Download, label: 'Export' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            <div className="max-w-md mx-auto px-6 pb-6">
                <div className="bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-stone-200 dark:border-zinc-800/50 text-stone-400 dark:text-zinc-500 rounded-[2rem] shadow-2xl shadow-stone-900/5 dark:shadow-black/40 px-4 py-3 flex justify-between items-center transition-all duration-300">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = currentView === tab.id;

                        if (tab.special) {
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onNavigate('add-item')}
                                    className="bg-stone-900 dark:bg-zinc-50 text-white dark:text-zinc-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all -my-1.5"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            );
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onNavigate(tab.id)}
                                className={`flex flex-col items-center justify-center w-12 transition-all duration-300 ${isActive ? 'text-stone-900 dark:text-zinc-50 scale-110' : 'hover:text-stone-600 dark:hover:text-zinc-300'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2 opacity-70'}`} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
