import React, { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export const LoginView = ({ onLogin }: { onLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!supabase) {
            setError('Supabase client not initialized');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                onLogin();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fafaf9] text-stone-900">
            <FadeIn className="w-full max-w-sm text-center">
                <div className="w-20 h-20 bg-stone-900 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-2xl shadow-stone-900/20 rotate-3">
                    <ShoppingBag className="text-white w-9 h-9" />
                </div>
                <h1 className="text-4xl font-serif font-bold mb-3">Holy Archive</h1>
                <p className="text-stone-500 mb-10 text-lg font-light">Inventory & Profit Tracking</p>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <Input
                        type="email"
                        label="Email"
                        placeholder="admin@holyarchive.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <Input
                        type="password"
                        label="Passwort"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full mt-8" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Anmelden'}
                    </Button>
                </form>
            </FadeIn>
        </div>
    );
};
