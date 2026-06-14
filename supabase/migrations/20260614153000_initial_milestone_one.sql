create extension if not exists pgcrypto;

create type public.app_role as enum (
  'owner_admin',
  'operations_manager',
  'buyer',
  'pickup_payment_coordinator',
  'market_lead',
  'seller'
);

create type public.scenario_status as enum (
  'draft',
  'under_review',
  'approved',
  'used_for_buying_trip',
  'archived'
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Cognexa Thrift Operations',
  slug text not null unique,
  currency_code text not null default 'KES' check (char_length(currency_code) = 3),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (business_id, user_id, role)
);

create index user_roles_user_id_idx on public.user_roles(user_id);
create index user_roles_business_id_idx on public.user_roles(business_id);

create table public.business_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  display_name text not null default 'Cognexa Thrift Operations',
  logo_path text,
  currency_code text not null default 'KES',
  stock_code_prefix text not null default 'D',
  timezone text not null default 'Africa/Nairobi',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.stock_scenarios (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  description text not null default '',
  status public.scenario_status not null default 'draft',
  planning_mode text not null default 'budget' check (planning_mode in ('budget', 'quantity')),
  total_capital integer not null default 0 check (total_capital >= 0),
  planned_stock_budget integer not null default 0 check (planned_stock_budget >= 0),
  data jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stock_scenarios_business_id_idx on public.stock_scenarios(business_id);
create index stock_scenarios_status_idx on public.stock_scenarios(status);
create unique index stock_scenarios_business_name_active_idx
  on public.stock_scenarios(business_id, lower(name))
  where archived_at is null;

create table public.scenario_expenses (
  id uuid primary key,
  scenario_id uuid not null references public.stock_scenarios(id) on delete cascade,
  name text not null,
  category text not null,
  amount integer not null check (amount >= 0),
  cost_type text not null check (cost_type in ('fixed', 'variable')),
  allocate_to_inventory boolean not null default false,
  notes text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scenario_expenses_scenario_id_idx on public.scenario_expenses(scenario_id);

create table public.scenario_categories (
  id uuid primary key,
  scenario_id uuid not null references public.stock_scenarios(id) on delete cascade,
  name text not null,
  budget integer not null check (budget >= 0),
  quantity integer not null check (quantity >= 0),
  average_buying_price integer not null check (average_buying_price >= 0),
  online_price integer not null check (online_price >= 0),
  market_price integer not null check (market_price >= 0),
  clearance_price integer not null check (clearance_price >= 0),
  online_percent integer not null check (online_percent between 0 and 100),
  market_percent integer not null check (market_percent between 0 and 100),
  clearance_percent integer not null check (clearance_percent between 0 and 100),
  discount_percent integer not null check (discount_percent between 0 and 100),
  damaged_percent integer not null check (damaged_percent between 0 and 100),
  unsold_percent integer not null check (unsold_percent between 0 and 100),
  priority text not null,
  data jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scenario_id, name),
  check (online_percent + market_percent + clearance_percent = 100),
  check (damaged_percent + unsold_percent <= 100)
);

create index scenario_categories_scenario_id_idx on public.scenario_categories(scenario_id);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_business_created_idx
  on public.audit_logs(business_id, created_at desc);

create table public.scenario_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger scenarios_set_updated_at
before update on public.stock_scenarios
for each row execute function public.set_updated_at();

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where business_id = target_business_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_business_role(
  target_business_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where business_id = target_business_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_business_id uuid;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  insert into public.businesses (name, slug, created_by)
  values (
    'Cognexa Thrift Operations',
    'cognexa-thrift-' || left(replace(new.id::text, '-', ''), 10),
    new.id
  )
  returning id into new_business_id;

  insert into public.user_roles (business_id, user_id, role)
  values (new_business_id, new.id, 'owner_admin');

  insert into public.business_settings (business_id)
  values (new_business_id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_scenario_children()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  item_index integer := 0;
begin
  delete from public.scenario_expenses where scenario_id = new.id;
  for item in select * from jsonb_array_elements(coalesce(new.data -> 'expenses', '[]'::jsonb))
  loop
    insert into public.scenario_expenses (
      id, scenario_id, name, category, amount, cost_type,
      allocate_to_inventory, notes, sort_order
    ) values (
      (item ->> 'id')::uuid,
      new.id,
      item ->> 'name',
      item ->> 'category',
      greatest(0, coalesce((item ->> 'amount')::integer, 0)),
      coalesce(item ->> 'costType', 'fixed'),
      coalesce((item ->> 'allocateToInventory')::boolean, false),
      coalesce(item ->> 'notes', ''),
      item_index
    );
    item_index := item_index + 1;
  end loop;

  item_index := 0;
  delete from public.scenario_categories where scenario_id = new.id;
  for item in select * from jsonb_array_elements(coalesce(new.data -> 'categories', '[]'::jsonb))
  loop
    insert into public.scenario_categories (
      id, scenario_id, name, budget, quantity, average_buying_price,
      online_price, market_price, clearance_price, online_percent,
      market_percent, clearance_percent, discount_percent, damaged_percent,
      unsold_percent, priority, data, sort_order
    ) values (
      (item ->> 'id')::uuid,
      new.id,
      item ->> 'name',
      greatest(0, coalesce((item ->> 'budget')::integer, 0)),
      greatest(0, coalesce((item ->> 'quantity')::integer, 0)),
      greatest(0, coalesce((item ->> 'averageBuyingPrice')::integer, 0)),
      greatest(0, coalesce((item ->> 'onlinePrice')::integer, 0)),
      greatest(0, coalesce((item ->> 'marketPrice')::integer, 0)),
      greatest(0, coalesce((item ->> 'clearancePrice')::integer, 0)),
      coalesce((item ->> 'onlinePercent')::integer, 0),
      coalesce((item ->> 'marketPercent')::integer, 0),
      coalesce((item ->> 'clearancePercent')::integer, 0),
      coalesce((item ->> 'discountPercent')::integer, 0),
      coalesce((item ->> 'damagedPercent')::integer, 0),
      coalesce((item ->> 'unsoldPercent')::integer, 0),
      coalesce(item ->> 'priority', 'medium'),
      item,
      item_index
    );
    item_index := item_index + 1;
  end loop;

  return new;
end;
$$;

create trigger stock_scenarios_sync_children
after insert or update of data on public.stock_scenarios
for each row execute function public.sync_scenario_children();

create or replace function public.audit_scenario_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (
    business_id, user_id, action, entity_type, entity_id, before_state, after_state
  ) values (
    coalesce(new.business_id, old.business_id),
    auth.uid(),
    case
      when tg_op = 'INSERT' then 'scenario_created'
      when tg_op = 'DELETE' then 'scenario_deleted'
      when old.status is distinct from new.status then 'scenario_status_changed'
      else 'scenario_updated'
    end,
    'stock_scenario',
    coalesce(new.id, old.id),
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create trigger stock_scenarios_audit
after insert or update or delete on public.stock_scenarios
for each row execute function public.audit_scenario_changes();

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.business_settings enable row level security;
alter table public.stock_scenarios enable row level security;
alter table public.scenario_expenses enable row level security;
alter table public.scenario_categories enable row level security;
alter table public.audit_logs enable row level security;
alter table public.scenario_templates enable row level security;

create policy "members can view businesses"
on public.businesses for select
using (public.is_business_member(id));

create policy "owners can update businesses"
on public.businesses for update
using (public.has_business_role(id, array['owner_admin']::public.app_role[]));

create policy "users can view own profile"
on public.profiles for select
using (id = auth.uid());

create policy "users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "members can view roles in their businesses"
on public.user_roles for select
using (public.is_business_member(business_id));

create policy "owners can manage roles"
on public.user_roles for all
using (public.has_business_role(business_id, array['owner_admin']::public.app_role[]))
with check (public.has_business_role(business_id, array['owner_admin']::public.app_role[]));

create policy "members can view settings"
on public.business_settings for select
using (public.is_business_member(business_id));

create policy "owners and operations can update settings"
on public.business_settings for update
using (
  public.has_business_role(
    business_id,
    array['owner_admin', 'operations_manager']::public.app_role[]
  )
);

create policy "members can view scenarios"
on public.stock_scenarios for select
using (public.is_business_member(business_id));

create policy "planning roles can create scenarios"
on public.stock_scenarios for insert
with check (
  created_by = auth.uid()
  and public.has_business_role(
    business_id,
    array['owner_admin', 'operations_manager', 'buyer']::public.app_role[]
  )
);

create policy "planning roles can update scenarios"
on public.stock_scenarios for update
using (
  public.has_business_role(
    business_id,
    array['owner_admin', 'operations_manager', 'buyer']::public.app_role[]
  )
)
with check (
  public.has_business_role(
    business_id,
    array['owner_admin', 'operations_manager', 'buyer']::public.app_role[]
  )
);

create policy "owners and operations can delete draft scenarios"
on public.stock_scenarios for delete
using (
  status = 'draft'
  and public.has_business_role(
    business_id,
    array['owner_admin', 'operations_manager']::public.app_role[]
  )
);

create policy "members can view scenario expenses"
on public.scenario_expenses for select
using (
  exists (
    select 1 from public.stock_scenarios scenario
    where scenario.id = scenario_id
      and public.is_business_member(scenario.business_id)
  )
);

create policy "members can view scenario categories"
on public.scenario_categories for select
using (
  exists (
    select 1 from public.stock_scenarios scenario
    where scenario.id = scenario_id
      and public.is_business_member(scenario.business_id)
  )
);

create policy "owners can view audit logs"
on public.audit_logs for select
using (
  public.has_business_role(
    business_id,
    array['owner_admin', 'operations_manager']::public.app_role[]
  )
);

create policy "authenticated users can view templates"
on public.scenario_templates for select
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('inventory-media', 'inventory-media', false)
on conflict (id) do nothing;

create policy "business members can view inventory media"
on storage.objects for select
using (
  bucket_id = 'inventory-media'
  and public.is_business_member((storage.foldername(name))[1]::uuid)
);

create policy "planning roles can upload inventory media"
on storage.objects for insert
with check (
  bucket_id = 'inventory-media'
  and public.has_business_role(
    (storage.foldername(name))[1]::uuid,
    array['owner_admin', 'operations_manager', 'buyer']::public.app_role[]
  )
);
