"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Item } from "@/types";
import { useLikes } from "@/hooks/useLikes";
import { conditionLabels } from "@/lib/utils";

interface ProductCardProps {
    item: Item & { like_count?: number };
}

export function ProductCard({ item }: ProductCardProps) {
    const mainImage = item.imageUrls?.[0] || "/placeholder.png";
    const { likeCount, isLiked, isLoading, isAuthenticated, toggleLike } = useLikes(
        item.id,
        item.like_count || 0
    );

    const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            // TODO: Show login modal or redirect
            alert('Bitte melde dich an, um Artikel zu liken');
            return;
        }

        toggleLike();
    };

    // Calculate original price (assuming 30% margin for demo)
    const originalPrice = item.salePriceEur ? Math.round(item.salePriceEur * 1.3) : null;

    return (
        <Link href={`/showroom/${item.id}`} className="group block">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm">
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                    <Image
                        src={mainImage}
                        alt={item.model}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />

                    {/* Like Button Overlay */}
                    <button
                        onClick={handleLikeClick}
                        disabled={isLoading}
                        className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:bg-white dark:hover:bg-black/90 transition-colors active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                        <Heart
                            className={`w-4 h-4 transition-all ${isLiked
                                    ? "fill-red-500 text-red-500"
                                    : "text-stone-700 dark:text-zinc-300"
                                }`}
                        />
                        <span className="text-stone-900 dark:text-white text-sm font-medium">
                            {likeCount}
                        </span>
                    </button>

                    {/* Status Badge */}
                    {item.status === "reserved" && (
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-md text-stone-900 dark:text-white text-xs font-bold px-3 py-1 rounded-full border border-stone-200 dark:border-zinc-700">
                            Gefragt
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-3">
                    {/* Brand and Condition */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-stone-900 dark:text-white font-medium text-sm truncate">
                            {item.brand}
                        </p>
                        <span className="text-stone-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                            {conditionLabels[item.condition]}
                        </span>
                    </div>

                    {/* Prices */}
                    <div className="space-y-0.5">
                        {originalPrice && (
                            <p className="text-stone-400 dark:text-zinc-500 text-xs line-through">
                                {originalPrice.toLocaleString("de-DE")} €
                            </p>
                        )}
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-stone-900 dark:text-white font-bold text-base">
                                {item.salePriceEur?.toLocaleString("de-DE")} €
                            </span>
                            <span className="text-teal-600 dark:text-teal-400 text-[10px] font-bold">
                                inkl. ⓘ
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
