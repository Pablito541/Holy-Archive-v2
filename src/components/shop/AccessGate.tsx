"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { FadeIn } from "../ui/FadeIn";
import { ArrowRight, Lock } from "lucide-react";

// Initialize client directly here or import shared client if public env vars are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function AccessGate() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { slug } = useParams();

    const memberKey = `member_of_${slug}`;

    useEffect(() => {
        // Redirect if already a member of *this* organization
        if (localStorage.getItem(memberKey)) {
            router.push(`/shop/${slug}/collection`);
        }
    }, [router, slug, memberKey]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Resolve Slug to Organization ID
            const { data: org, error: orgError } = await supabase
                .from("organizations")
                .select("id, name")
                .eq("slug", slug)
                .single();

            if (orgError || !org) {
                alert("Showroom not found.");
                setLoading(false);
                return;
            }

            // 2. Insert Lead with Organization ID
            const { error } = await supabase.from("leads").insert([
                { email, name, source: "showroom_gate", organization_id: org.id },
            ]);

            if (error) throw error;

            // 3. Set "Token"
            localStorage.setItem(memberKey, "true");
            router.push(`/shop/${slug}/collection`);
        } catch (error) {
            console.error("Error joining:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <FadeIn className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#fafaf9]">
            <div className="max-w-md w-full space-y-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-black/5 p-4 rounded-full">
                        <Lock className="w-8 h-8 opacity-60" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-serif tracking-tight">The Archive: {slug}</h1>
                    <p className="text-muted-foreground">
                        Exklusiver Zugang zum Inventar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-8">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Dein Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                        <input
                            type="email"
                            placeholder="E-Mail Adresse"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition-all"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-black text-white px-6 py-4 rounded-lg font-medium hover:bg-black/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? "Öffne Archive..." : "Zugang anfordern"}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <p className="text-xs text-muted-foreground pt-4">
                    Mit dem Beitritt akzeptierst du unsere{" "}
                    <a href="#" className="underline">Datenschutzerklärung</a>.
                </p>
            </div>
        </FadeIn>
    );
}
