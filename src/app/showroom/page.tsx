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
    const slug = SHOWROOM_SLUG;
    const supabase = await createClient();

    // 1. Resolve Org
    const { data: org } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("slug", slug)
        .single();

    if (!org) {
        notFound();
    }

    // 2. Fetch Items from Showroom View
    const { data: itemData } = await supabase
        .from("showroom_items")
        .select("*")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false });

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
}
