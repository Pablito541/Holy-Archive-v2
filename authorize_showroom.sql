-- Let's expose all statuses to the view, but the FE currently filters 'in_stock'.

-- 1. Create a secure view of Official User IDs
-- This view runs with owner privileges (postgres), allowing access to auth.users
create or replace view official_user_ids with (security_barrier) as
select id
from auth.users
where email like '%@holyarchive%';

grant select on official_user_ids to anon, authenticated;

-- 2. Create Showroom View using optimized JOIN
create or replace view showroom_items as
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

-- Grant access to the view
grant select on showroom_items to anon, authenticated;

-- 2. Revoke Direct Access
-- (Revoking 'select' from public on 'items' might break existing RLS policies depending on how they are defined.
-- Currently 'items' has RLS enabled.
-- Policy "Public items view" exists. We should DROP it.)
drop policy if exists "Public items view" on items;

-- 3. Data Integrity Trigger
create or replace function set_item_organization() returns trigger as $$
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

drop trigger if exists tr_set_item_organization on items;
create trigger tr_set_item_organization
before insert on items
for each row execute function set_item_organization();

-- 4. Performance Index
create index if not exists idx_items_showroom
on items(organization_id, status, created_at desc);
```
