"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Item } from "@/types";
import { WhatsAppButton } from "../../../../../components/shop/WhatsAppButton";
import { FadeIn } from "../../../../../components/ui/FadeIn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ShopItemPage() {
    const { id, slug } = useParams();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Guard
        if (!localStorage.getItem(`member_of_${slug}`)) {
            router.push(`/shop/${slug}`);
            return;
        }

        const fetchItem = async () => {
            const { data, error } = await supabase
                .from("showroom_items")
                .select("*")
                .eq("id", id)
                .single();

            if (data) {
                // Map
                const mapped: Item = {
                    ...data,
                    // Private fields are hidden by the view
                    purchasePriceEur: 0,
                    purchaseDate: "",
                    purchaseSource: "",
                    // Public fields
                    salePriceEur: data.sale_price_eur,
                    saleDate: null,
                    saleChannel: null,
                    platformFeesEur: 0,
                    shippingCostEur: 0,
                    reservedFor: data.reserved_for,
                    reservedUntil: data.reserved_until,
                    imageUrls: data.image_urls || [],
                    createdAt: data.created_at,
                };
                setItem(mapped);
            }
            setLoading(false);
        };

        fetchItem();
    }, [id, slug, router]);

    if (loading || !item) {
        return <div className="min-h-screen flex items-center justify-center">Laden...</div>;
    }

    return (
        <FadeIn className="max-w-7xl mx-auto px-4 py-8">
            <Link href={`/shop/${slug}/collection`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Übersicht
            </Link>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden">
                        <img src={item.imageUrls[0]} alt={item.model} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {item.imageUrls.slice(1).map((url, idx) => (
                            <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img src={url} alt={`Detail ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="space-y-8">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground uppercase">{item.brand}</span>
                        <h1 className="text-4xl font-serif mt-2 mb-4">{item.model}</h1>
                        <div className="text-2xl font-medium">{item.salePriceEur?.toLocaleString('de-DE')} €</div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-dashed border-border pb-2">
                            <span className="text-muted-foreground">Zustand</span>
                            <span className="font-medium capitalize">{item.condition.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-border pb-2">
                            <span className="text-muted-foreground">Kategorie</span>
                            <span className="font-medium capitalize">{item.category}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 leading-relaxed">
                        {item.notes || "Keine weitere Beschreibung verfügbar."}
                    </div>

                    <div className="pt-4">
                        <WhatsAppButton item={item} className="w-full" />
                        <p className="text-xs text-center text-muted-foreground mt-3">
                            Kaufabwicklung erfolgt persönlich und sicher über WhatsApp.
                        </p>
                    </div>
                </div>
            </div>
        </FadeIn>
    );
}
