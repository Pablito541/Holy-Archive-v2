"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function ShopHeader() {
    const { slug } = useParams();

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href={`/shop/${slug}/collection`} className="font-serif text-xl font-bold tracking-tight">
                    Holy Archive
                </Link>
                <div className="text-xs font-medium px-2 py-1 bg-black/5 rounded text-muted-foreground uppercase tracking-wider">
                    Exclusive Showroom
                </div>
            </div>
        </header>
    );
}
