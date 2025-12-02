import React, { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { FadeIn } from '../ui/FadeIn';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

export const LoginView = ({ onLogin }: { onLogin: (user: any) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!supabase) {
            // Fallback for demo/no-supabase mode
            setTimeout(() => {
                onLogin({ email: 'demo@example.com' });
                setLoading(false);
            }, 1000);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showToast(error.message, 'error');
            setLoading(false);
        } else {
            // Auth state change will be caught by page.tsx listener
            // But we can also call onLogin as a direct callback
            if (data.user) {
                onLogin(data.user);
            }
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
                        onChange={(e: any) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        label="Passwort"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" className="w-full mt-8" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Anmelden'}
                    </Button>
                </form>
            </FadeIn>
        </div>
    );
};

