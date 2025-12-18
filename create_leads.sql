-- Create leads table for showroom access
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  name text,
  source text default 'showroom_gate'
);

-- Enable RLS
alter table leads enable row level security;

-- Allow public insert (for the gate form)
create policy "Allow public insert to leads"
on leads for insert
to public
with check (true);

-- Only allow authenticated users (admin) to view leads
create policy "Allow authenticated view leads"
on leads for select
to authenticated
using (true);
