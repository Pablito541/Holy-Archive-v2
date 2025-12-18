-- 1. DROP old restrictive policy
drop policy if exists "Users can only access their own items" on items;

-- 2. Create new policy: "Organization Members can access all items in their org"
-- This allows any member of the organization to select/insert/update/delete items belonging to that organization.
create policy "Organization Members Access"
on items
for all
to authenticated
using (
  auth.uid() in (
    select user_id 
    from organization_members 
    where organization_id = items.organization_id
  )
);

-- 3. Ensure 'organization_id' is required/checked on INSERT
-- The trigger 'tr_set_item_organization' handles assignment.
-- The policy above ensures they can only insert if they are a member of the resulting org.

-- 4. Grant access to 'organization_members' for authenticated users (to check their own membership)
-- This is needed for the policy subquery to work efficiently? 
-- Actually, we should probably have a secure RLS on organization_members too.
alter table organization_members enable row level security;

create policy "Users can view their own memberships"
on organization_members
for select
to authenticated
using (auth.uid() = user_id);

-- Also allow viewing memberships of the same organization? 
-- For now, just own membership is enough for the subquery above (auth.uid() = user_id check matches).
