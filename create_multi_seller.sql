-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Public read access for profiles (so we can find user_id from username)
create policy "Public profiles are viewable by everyone"
on profiles for select
to public
using (true);

-- Users can update their own profile
create policy "Users can update own profile"
on profiles for update
to authenticated
using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile"
on profiles for insert
to authenticated
with check (auth.uid() = id);

-- Update leads table to support multiple sellers
alter table leads add column if not exists seller_id uuid references auth.users(id);

-- Update leads RLS to allow public insert with seller_id
drop policy if exists "Allow public insert to leads" on leads;
create policy "Allow public insert to leads"
on leads for insert
to public
with check (true);

-- Update leads RLS to allow sellers to see ONLY their own leads
drop policy if exists "Allow authenticated view leads" on leads;
create policy "Sellers can view own leads"
on leads for select
to authenticated
using (auth.uid() = seller_id);
