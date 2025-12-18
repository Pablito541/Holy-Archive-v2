import { createClient } from '../../lib/supabase-server';
import DashboardClient from './DashboardClient';
import { Item } from '../../types';

export const metadata = {
  title: "Holy Archive | Dashboard",
  description: "Management and analytics.",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Get Session
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  let initialOrgId: string | null = null;
  let initialItems: Item[] = [];

  if (user) {
    // 2. Fetch Organization
    const { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (member) {
      initialOrgId = member.organization_id;

      // 3. Fetch Initial Items
      const { data } = await supabase
        .from('items')
        .select('*')
        .eq('organization_id', initialOrgId)
        .order('created_at', { ascending: false })
        .range(0, 49); // PAGE_SIZE - 1

      if (data) {
        initialItems = data.map((d: any) => ({
          id: d.id,
          brand: d.brand,
          model: d.model,
          category: d.category,
          condition: d.condition,
          status: d.status,
          purchasePriceEur: d.purchase_price_eur,
          purchaseDate: d.purchase_date,
          purchaseSource: d.purchase_source,
          salePriceEur: d.sale_price_eur,
          saleDate: d.sale_date,
          saleChannel: d.sale_channel,
          platformFeesEur: d.platform_fees_eur,
          shipping_cost_eur: d.shipping_cost_eur,
          reservedFor: d.reserved_for,
          reservedUntil: d.reserved_until,
          imageUrls: d.image_urls || [],
          notes: d.notes,
          createdAt: d.created_at
        }));
      }
    }
  }

  return (
    <DashboardClient
      initialUser={user}
      initialOrgId={initialOrgId}
      initialItems={initialItems}
    />
  );
}