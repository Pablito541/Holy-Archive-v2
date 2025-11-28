import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginView = ({ onLogin }: { onLogin: () => void }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fafaf9] text-stone-900">
            <FadeIn className="w-full max-w-sm text-center">
                <div className="w-20 h-20 bg-stone-900 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-stone-900/20 rotate-3">
                    <ShoppingBag className="text-white w-9 h-9" />
                </div>
                <h1 className="text-4xl font-serif font-bold mb-3">Holy Archive</h1>
                <p className="text-stone-500 mb-10 text-lg font-light">Inventory & Profit Tracking</p>

                <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-4 text-left">
                    <Input type="email" label="Email" placeholder="admin@holyarchive.com" defaultValue="admin@holyarchive.com" />
                    <Input type="password" label="Passwort" placeholder="••••••••" defaultValue="password" />
                    <Button type="submit" className="w-full mt-8">Anmelden</Button>
                </form>
            </FadeIn>
        </div>
    );
};
