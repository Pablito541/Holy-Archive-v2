"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Item } from "@/types";
import { WhatsAppButton } from "../../../components/shop/WhatsAppButton";
import { FadeIn } from "../../../components/ui/FadeIn";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AccessGate } from "../../../components/shop/AccessGate";
import { SHOWROOM_SLUG } from "@/constants";

interface ShowroomItemClientProps {
    item: Item;
}

export default function ShowroomItemClient({ item }: ShowroomItemClientProps) {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    const memberKey = `member_of_${SHOWROOM_SLUG}`;

    useEffect(() => {
        setHasAccess(!!localStorage.getItem(memberKey));
    }, [memberKey]);

    if (hasAccess === null) return null;

    if (!hasAccess) {
        return <AccessGate onSuccess={() => setHasAccess(true)} slug={SHOWROOM_SLUG} />;
    }

    return (
        <FadeIn className="max-w-7xl mx-auto px-4 py-8">
            <Link href="/showroom" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-black mb-8">
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Übersicht
            </Link>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden">
                        <Image
                            src={item.imageUrls[0]}
                            alt={item.model}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                    {item.imageUrls.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                            {item.imageUrls.slice(1).map((url, idx) => (
                                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={url}
                                        alt={`Detail ${idx}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 25vw, 12vw"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
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
