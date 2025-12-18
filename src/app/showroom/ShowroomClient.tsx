"use client";

import { useEffect, useState } from "react";
import { Item } from "@/types";
import { ProductCard } from "../../components/shop/ProductCard";
import { ShopHeader } from "../../components/shop/ShopHeader";
import { FadeIn } from "../../components/ui/FadeIn";
import { AccessGate } from "../../components/shop/AccessGate";
import { SHOWROOM_SLUG } from "@/constants";

interface ShowroomClientProps {
    initialItems: Item[];
    initialOrgName: string;
    initialOrgId: string;
}

export default function ShowroomClient({ initialItems, initialOrgName, initialOrgId }: ShowroomClientProps) {
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    const memberKey = `member_of_${SHOWROOM_SLUG}`;

    useEffect(() => {
        // Check access on mount
        setHasAccess(!!localStorage.getItem(memberKey));
    }, [memberKey]);

    if (hasAccess === null) return null; // Wait for mount check

    if (!hasAccess) {
        return <AccessGate onSuccess={() => setHasAccess(true)} slug={SHOWROOM_SLUG} initialOrgName={initialOrgName} initialOrgId={initialOrgId} />;
    }

    return (
        <div className="min-h-screen bg-[#fafaf9]">
            <ShopHeader />

            <main className="max-w-7xl mx-auto px-4 py-12">
                <FadeIn>
                    <div className="mb-12 text-center md:text-left">
                        <h2 className="text-3xl font-serif">Kollektion</h2>
                        <p className="text-muted-foreground mt-2">Kuratiertes Inventar und Unikate von {initialOrgName}.</p>
                    </div>

                    {initialItems.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-black/10">
                            <p className="text-muted-foreground italic">Aktuell keine Artikel in der Kollektion.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {initialItems.map((item) => (
                                <ProductCard key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </FadeIn>
            </main>
        </div>
    );
}
