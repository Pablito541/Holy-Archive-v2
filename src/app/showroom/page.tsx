import { createClient } from "@/lib/supabase-server";
import { Item } from "@/types";
import ShowroomClient from "./ShowroomClient";
import { notFound } from "next/navigation";
import { SHOWROOM_SLUG } from "@/constants";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createClient();
    const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("slug", SHOWROOM_SLUG)
        .single();

    return {
        title: org ? `${org.name} | Collection` : "Showroom",
        description: `Explore our curated selection of luxury goods at ${org?.name || 'our archive'}.`,
    };
}

export default async function ShowroomPage() {
    try {
        const slug = SHOWROOM_SLUG;
        const supabase = await createClient();

        // 1. Resolve Org
        const { data: org, error: orgError } = await supabase
            .from("organizations")
            .select("id, name")
            .eq("slug", slug)
            .single();

        if (orgError) {
            console.error("ShowroomPage: Error fetching organization:", orgError);
            throw new Error("Kollektion nicht gefunden.");
        }

        if (!org) {
            notFound();
        }

        // 2. Fetch Items from Showroom View
        const { data: itemData, error: itemsError } = await supabase
            .from("showroom_items")
            .select("*")
            .eq("organization_id", org.id)
            .order("created_at", { ascending: false });

        if (itemsError) {
            console.error("ShowroomPage: Error fetching items:", itemsError);
            // We don't necessarily want to crash the whole page if items fail, 
            // but for showroom it's critical.
        }

        const mappedItems: Item[] = (itemData || []).map((d: any) => ({
            id: d.id,
            organization_id: d.organization_id,
            brand: d.brand,
            model: d.model,
            category: d.category,
            condition: d.condition,
            notes: d.notes,
            status: d.status,
            imageUrls: d.image_urls || [],
            salePriceEur: d.sale_price_eur || 0,
            purchasePriceEur: 0,
            purchaseDate: "",
            purchaseSource: "",
            reservedFor: d.reserved_for || null,
            reservedUntil: d.reserved_until || null,
            createdAt: d.created_at,
        }));

        return (
            <ShowroomClient
                initialItems={mappedItems}
                initialOrgName={org.name}
                initialOrgId={org.id}
            />
        );
    } catch (error: any) {
        console.error("ShowroomPage: Unhandled exception:", error);
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafaf9]">
                <div className="max-w-md w-full text-center space-y-4">
                    <h1 className="text-2xl font-serif font-bold text-stone-900">Ein Fehler ist aufgetreten</h1>
                    <p className="text-stone-600">
                        Die Kollektion konnte derzeit nicht geladen werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.
                    </p>
                    <div className="text-xs text-stone-400 bg-stone-100 p-3 rounded-lg overflow-auto max-h-32 text-left font-mono">
                        {error.message || "Unbekannter Server-Fehler"}
                    </div>
                </div>
            </div>
        );
    }
}
