"use client";

import { MessageCircle } from "lucide-react";
import { Item } from "@/types";

interface WhatsAppButtonProps {
    item: Item;
    variant?: "primary" | "icon";
    className?: string;
}

export function WhatsAppButton({ item, variant = "primary", className = "" }: WhatsAppButtonProps) {
    // Mobile numbers should be international format without + or 00 usually for wa.me links, but let's assume valid number provided or hardcode one.
    // Ideally this comes from config/env.
    const PHONE_NUMBER = "49123456789"; // REPLACE WITH USER NUMBER

    const text = `Hi, ich habe Interesse an dem Artikel: ${item.brand} ${item.model} (${item.salePriceEur} EUR). Ist der noch da?`;
    const href = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`;

    if (variant === "icon") {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 bg-[#25D366] text-white flex items-center justify-center rounded-full hover:bg-[#128C7E] transition-colors shadow-sm ${className}`}
                aria-label="Buy on WhatsApp"
                onClick={(e) => e.stopPropagation()} // Prevent card click
            >
                <MessageCircle className="w-5 h-5" />
            </a>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors ${className}`}
        >
            <MessageCircle className="w-5 h-5" />
            <span>Per WhatsApp kaufen</span>
        </a>
    );
}
