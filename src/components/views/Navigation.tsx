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
                <div className="bg-stone-900/90 backdrop-blur-xl text-stone-400 rounded-3xl shadow-2xl shadow-stone-900/30 px-4 py-3 flex justify-between items-center">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = currentView === tab.id;

                        if (tab.special) {
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onNavigate('add-item')}
                                    className="bg-white text-stone-900 w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform -my-1.5"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            );
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onNavigate(tab.id)}
                                className={`flex flex-col items-center justify-center w-12 transition-colors ${isActive ? 'text-white' : 'hover:text-stone-200'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};
