"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Item } from "@/types";
import { WhatsAppButton } from "./WhatsAppButton";

export function ProductCard({ item }: { item: Item }) {
    const mainImage = item.imageUrls?.[0] || "/placeholder.png";

    return (
        <Link href={`/showroom/${item.id}`} className="group block">
            <div className="bg-white rounded-xl overflow-hidden border border-black/5 hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[4/5] bg-[#f0f0f0] overflow-hidden">
                    {/* Use a standard img for simplicity if remote patterns not configured, else Image with fill */}
                    <Image
                        src={mainImage}
                        alt={item.model}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                        <WhatsAppButton item={item} variant="icon" />
                    </div>
                    {item.status === 'reserved' && (
                        <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                            RESERVIERT
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.brand}</p>
                            <h3 className="font-serif text-lg leading-tight mt-1">{item.model}</h3>
                        </div>
                        <div className="text-right">
                            <span className="font-medium">{item.salePriceEur?.toLocaleString('de-DE')} €</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
