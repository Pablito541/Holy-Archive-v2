import { createClient } from "@/lib/supabase-server";
import { Item } from "@/types";
import ShowroomItemClient from "./ShowroomItemClient";
import { notFound } from "next/navigation";

export default async function ShopItemPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("showroom_items")
        .select("*")
        .eq("id", id)
        .single();

    if (!data || error) {
        notFound();
    }

    const item: Item = {
        ...data,
        purchasePriceEur: 0,
        purchaseDate: "",
        purchaseSource: "",
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

    return <ShowroomItemClient item={item} />;
}
