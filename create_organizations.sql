-- 1. Create Organizations Table
create table if not exists organizations (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Organization Members Table
create table if not exists organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, user_id)
);

-- 3. Add organization_id to items and leads
alter table items add column if not exists organization_id uuid references organizations(id);
alter table leads add column if not exists organization_id uuid references organizations(id);
-- (Optional) Drop user_id/seller_id later, but keep for now for safety backup

-- 4. Enable RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;

-- 5. Policies
-- Organizations: Public can read (needed for landing page/showroom to verify slug exists)
drop policy if exists "Public organizations view" on organizations;
create policy "Public organizations view"
on organizations for select
to public
using (true);

-- Members: Users can see which organizations they belong to
drop policy if exists "Users view their memberships" on organization_members;
create policy "Users view their memberships"
on organization_members for select
to authenticated
using (auth.uid() = user_id);

-- 6. DATA MIGRATION
do $$
declare
  v_org_id uuid;
  v_user_id uuid := '0f8be478-69a7-4934-8783-b7eb531d9190'; -- Pauls ID
begin
  -- Create 'Holy Archive' Org if not exists
  insert into organizations (slug, name)
  values ('holy-archive', 'Holy Archive')
  on conflict (slug) do nothing;
  
  -- Get the ID
  select id into v_org_id from organizations where slug = 'holy-archive';

  -- Add Paul as Owner
  insert into organization_members (organization_id, user_id, role)
  values (v_org_id, v_user_id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  -- Migrate Items
  update items
  set organization_id = v_org_id
  where user_id = v_user_id
  and organization_id is null;

  -- Migrate Leads
  update leads
  set organization_id = v_org_id
  where seller_id = v_user_id
  and organization_id is null;
end $$;
