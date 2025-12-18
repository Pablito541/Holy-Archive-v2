import { createClient } from '../../lib/supabase-server';
import DashboardClient from './DashboardClient';
import { Item } from '../../types';

export const metadata = {
  title: "Holy Archive | Dashboard",
  description: "Management and analytics.",
};

export default async function DashboardPage() {
  try {
    const supabase = await createClient();

    // 1. Get Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("DashboardPage: Session error:", sessionError);
    }
    const user = session?.user ?? null;

    let initialOrgId: string | null = null;
    let initialItems: Item[] = [];

    if (user) {
      // 2. Fetch Organization
      const { data: member, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error("DashboardPage: Error fetching organization membership:", memberError);
      }

      if (member) {
        initialOrgId = member.organization_id;

        // 3. Fetch Initial Items
        const { data, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('organization_id', initialOrgId)
          .order('created_at', { ascending: false })
          .range(0, 49); // PAGE_SIZE - 1

        if (itemsError) {
          console.error("DashboardPage: Error fetching items:", itemsError);
        }

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
  } catch (error: any) {
    console.error("DashboardPage: Unhandled exception:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafaf9]">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-serif font-bold text-stone-900">Dashboard-Fehler</h1>
          <p className="text-stone-600">
            Das Dashboard konnte derzeit nicht geladen werden. Bitte versuchen Sie es später erneut.
          </p>
          <div className="text-xs text-stone-400 bg-stone-100 p-3 rounded-lg overflow-auto max-h-32 text-left font-mono">
            {error.message || "Unbekannter Server-Fehler"}
          </div>
        </div>
      </div>
    );
  }
}