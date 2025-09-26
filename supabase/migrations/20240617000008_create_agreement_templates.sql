-- Create consignment agreement templates table
create table if not exists public.consignment_agreement_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.consignment_agreement_templates enable row level security;

-- Allow all authenticated users to select, insert, update, and delete
create policy "Allow select for authenticated" on public.consignment_agreement_templates for select to authenticated using (true);
create policy "Allow insert for authenticated" on public.consignment_agreement_templates for insert to authenticated with check (true);
create policy "Allow update for authenticated" on public.consignment_agreement_templates for update to authenticated using (true) with check (true);
create policy "Allow delete for authenticated" on public.consignment_agreement_templates for delete to authenticated using (true); 