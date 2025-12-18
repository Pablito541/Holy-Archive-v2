-- 1. Performance: Add Missing Indexes
-- leads table foreign keys
create index if not exists idx_leads_organization_id on public.leads(organization_id);
create index if not exists idx_leads_seller_id on public.leads(seller_id);

-- organization_members table foreign keys
create index if not exists idx_organization_members_user_id on public.organization_members(user_id);

-- 2. Performance: Remove Duplicate Index
drop index if exists idx_items_showroom_perf;

-- 3. Security: Secure the set_item_organization function
-- The advisor warned about mutable search_path. We set it to public.
create or replace function set_item_organization() returns trigger 
security definer
set search_path = public
as $$
begin
  if new.organization_id is null then
    select organization_id into new.organization_id
    from organization_members
    where user_id = new.user_id
    limit 1;
  end if;
  return new;
end;
$$ language plpgsql;


-- 4. Security: Updates Showroom View to be Security Invoker
-- First, ensure official_user_ids exists (as it is a dependency)
create or replace view official_user_ids with (security_barrier) as
select id
from auth.users
where email like '%@holyarchive%';

grant select on official_user_ids to anon, authenticated;

-- This ensures RLS policies are checked against the invoking user (e.g. anon/authenticated)
-- NOTE: We must ensure a policy exists for 'anon' to read 'items', otherwise this view will return nothing for valid items.

create or replace view showroom_items with (security_invoker = true) as
select
  i.id,
  i.organization_id,
  i.brand,
  i.model,
  i.category,
  i.condition,
  i.sale_price_eur,
  i.image_urls,
  i.status,
  i.reserved_for,
  i.reserved_until,
  i.created_at
from items i
join official_user_ids u on i.user_id = u.id
where
  i.status = 'in_stock';


-- 5. Security: Allow public access to in_stock items via RLS
-- This is required because the view is now security_invoker.
drop policy if exists "Public can view in_stock items" on items;
create policy "Public can view in_stock items"
on items for select
to public
using (status = 'in_stock');
