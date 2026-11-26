-- FinAgent AI initial tenant-safe workspace schema.
-- Applied to the dedicated Supabase project gdypuijoymrtpngxgrlq in ap-south-1.
-- Every company's records are isolated by owner_id through Row Level Security.

create table if not exists public.companies (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 2 and 120),
 country text not null,
 base_currency char(3) not null,
 business_type text not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists companies_owner_id_idx on public.companies(owner_id);

create table if not exists public.invoices (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id) on delete cascade,
 created_by uuid not null default auth.uid() references auth.users(id),
 invoice_number text not null,
 customer_name text not null,
 customer_email text,
 amount numeric(14,2) not null check (amount >= 0),
 currency char(3) not null,
 due_date date not null,
 status text not null default 'open' check (status in ('open','paid','disputed','void')),
 notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(company_id, invoice_number)
);
create index if not exists invoices_company_due_idx on public.invoices(company_id,due_date);
create index if not exists invoices_company_status_idx on public.invoices(company_id,status);

alter table public.companies enable row level security;
alter table public.invoices enable row level security;

drop policy if exists company_select_own on public.companies;
create policy company_select_own on public.companies for select to authenticated using (owner_id = (select auth.uid()));
drop policy if exists company_insert_own on public.companies;
create policy company_insert_own on public.companies for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists company_update_own on public.companies;
create policy company_update_own on public.companies for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists company_delete_own on public.companies;
create policy company_delete_own on public.companies for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists invoice_select_own_company on public.invoices;
create policy invoice_select_own_company on public.invoices for select to authenticated using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid())));
drop policy if exists invoice_insert_own_company on public.invoices;
create policy invoice_insert_own_company on public.invoices for insert to authenticated with check (created_by = (select auth.uid()) and exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid())));
drop policy if exists invoice_update_own_company on public.invoices;
create policy invoice_update_own_company on public.invoices for update to authenticated using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid()))) with check (created_by = (select auth.uid()) and exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid())));
drop policy if exists invoice_delete_own_company on public.invoices;
create policy invoice_delete_own_company on public.invoices for delete to authenticated using (exists (select 1 from public.companies c where c.id = company_id and c.owner_id = (select auth.uid())));

grant select, insert, update, delete on public.companies, public.invoices to authenticated;
