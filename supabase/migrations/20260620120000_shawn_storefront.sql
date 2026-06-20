-- SHAWN Apparel storefront: drop-based, one-of-one e-commerce.
-- Each product is a single unique unit. Inventory is protected with
-- row-level locking so two shoppers can never buy the same piece.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.drop_status as enum ('draft', 'active', 'archived');

create type public.product_status as enum (
  'available',
  'reserved',
  'sold',
  'hidden'
);

create type public.store_order_status as enum (
  'pending',
  'awaiting_payment',
  'paid',
  'failed',
  'cancelled',
  'fulfilled'
);

-- ---------------------------------------------------------------------------
-- Store settings (singleton row)
-- ---------------------------------------------------------------------------
create table public.store_settings (
  id boolean primary key default true,
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  free_delivery_threshold integer check (free_delivery_threshold >= 0),
  currency_code text not null default 'KES' check (char_length(currency_code) = 3),
  whatsapp_number text not null default '',
  support_email text not null default '',
  updated_at timestamptz not null default now(),
  constraint store_settings_singleton check (id)
);

insert into public.store_settings (id, delivery_fee, whatsapp_number, support_email)
values (true, 0, '', '')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Drops
-- ---------------------------------------------------------------------------
create table public.drops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  status public.drop_status not null default 'draft',
  launch_date timestamptz,
  cover_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drops_status_idx on public.drops(status);
create index drops_sort_idx on public.drops(sort_order desc, launch_date desc);

-- ---------------------------------------------------------------------------
-- Products (one-of-one: exactly one unit per row)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  drop_id uuid references public.drops(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0), -- whole Kenyan Shillings
  currency text not null default 'KES' check (char_length(currency) = 3),
  size text,
  category text,
  condition text,
  measurements jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  image_color text,
  status public.product_status not null default 'available',
  reserved_until timestamptz,
  reserved_order_id uuid,
  sold_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_drop_id_idx on public.products(drop_id);
create index products_status_idx on public.products(status);
create index products_reserved_until_idx on public.products(reserved_until)
  where status = 'reserved';

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_location text not null,
  delivery_notes text not null default '',
  subtotal integer not null default 0 check (subtotal >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  total integer not null default 0 check (total >= 0),
  currency text not null default 'KES' check (char_length(currency) = 3),
  status public.store_order_status not null default 'pending',
  paystack_reference text unique,
  paystack_access_code text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_status_idx on public.orders(status);
create index orders_created_idx on public.orders(created_at desc);

alter table public.products
  add constraint products_reserved_order_fk
  foreign key (reserved_order_id) references public.orders(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Order items (price + title snapshot at purchase time)
-- ---------------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  title_snapshot text not null,
  price_snapshot integer not null check (price_snapshot >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuse public.set_updated_at from milestone one)
-- ---------------------------------------------------------------------------
create trigger drops_set_updated_at
before update on public.drops
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger store_settings_set_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Inventory logic: race-safe reservation, payment, release, expiry.
-- All functions are SECURITY DEFINER and only ever called server side.
-- ---------------------------------------------------------------------------

-- Begin a checkout: lock every product row, confirm availability, create the
-- order as awaiting_payment, snapshot line items, and reserve the products for
-- a short window. Raises on any conflict so no two orders hold the same piece.
create or replace function public.begin_checkout(
  p_product_ids uuid[],
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_location text,
  p_delivery_notes text,
  p_reference text,
  p_reserve_minutes integer default 15
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_product public.products;
  v_subtotal integer := 0;
  v_delivery_fee integer := 0;
  v_now timestamptz := now();
  v_distinct integer;
  v_found integer;
begin
  if p_product_ids is null or array_length(p_product_ids, 1) is null then
    raise exception 'No items provided' using errcode = 'P0001';
  end if;

  select count(distinct x) into v_distinct from unnest(p_product_ids) as x;
  if v_distinct <> array_length(p_product_ids, 1) then
    raise exception 'A cart cannot contain the same one of one piece twice'
      using errcode = 'P0001';
  end if;

  -- Lock the rows in a stable order to avoid deadlocks between concurrent carts.
  for v_product in
    select * from public.products
    where id = any(p_product_ids)
    order by id
    for update
  loop
    if v_product.status = 'sold' then
      raise exception 'SOLD:%', v_product.title using errcode = 'P0002';
    elsif v_product.status = 'hidden' then
      raise exception 'UNAVAILABLE:%', v_product.title using errcode = 'P0002';
    elsif v_product.status = 'reserved'
          and v_product.reserved_until is not null
          and v_product.reserved_until > v_now then
      raise exception 'RESERVED:%', v_product.title using errcode = 'P0002';
    end if;
    v_subtotal := v_subtotal + v_product.price;
  end loop;

  select count(*) into v_found from public.products where id = any(p_product_ids);
  if v_found <> array_length(p_product_ids, 1) then
    raise exception 'Some items could not be found' using errcode = 'P0002';
  end if;

  select coalesce(delivery_fee, 0) into v_delivery_fee
  from public.store_settings where id = true;
  v_delivery_fee := coalesce(v_delivery_fee, 0);

  insert into public.orders (
    customer_name, customer_email, customer_phone, delivery_location,
    delivery_notes, subtotal, delivery_fee, total, currency, status,
    paystack_reference
  ) values (
    p_customer_name, p_customer_email, p_customer_phone, p_delivery_location,
    coalesce(p_delivery_notes, ''), v_subtotal, v_delivery_fee,
    v_subtotal + v_delivery_fee, 'KES', 'awaiting_payment', p_reference
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, title_snapshot, price_snapshot)
  select v_order.id, p.id, p.title, p.price
  from public.products p
  where p.id = any(p_product_ids);

  update public.products
  set status = 'reserved',
      reserved_until = v_now + make_interval(mins => greatest(p_reserve_minutes, 1)),
      reserved_order_id = v_order.id,
      updated_at = v_now
  where id = any(p_product_ids);

  return v_order;
end;
$$;

-- Confirm a paid order. Idempotent: a second call (webhook plus callback) is a
-- no-op once the order is already paid, so duplicate confirmations are safe.
create or replace function public.mark_order_paid(
  p_reference text,
  p_access_code text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_now timestamptz := now();
begin
  select * into v_order from public.orders
  where paystack_reference = p_reference
  for update;

  if v_order.id is null then
    raise exception 'Order not found for reference %', p_reference
      using errcode = 'P0002';
  end if;

  if v_order.status in ('paid', 'fulfilled') then
    return v_order;
  end if;

  update public.orders
  set status = 'paid',
      paid_at = v_now,
      paystack_access_code = coalesce(p_access_code, paystack_access_code),
      updated_at = v_now
  where id = v_order.id
  returning * into v_order;

  update public.products
  set status = 'sold',
      sold_at = v_now,
      reserved_until = null,
      updated_at = v_now
  where reserved_order_id = v_order.id;

  return v_order;
end;
$$;

-- Release an order that failed, was abandoned, or expired. Never touches a
-- paid order, so a late failure callback cannot un-sell a piece.
create or replace function public.release_order(
  p_reference text,
  p_status public.store_order_status default 'failed'
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_now timestamptz := now();
begin
  select * into v_order from public.orders
  where paystack_reference = p_reference
  for update;

  if v_order.id is null then
    return null;
  end if;

  if v_order.status in ('paid', 'fulfilled') then
    return v_order;
  end if;

  update public.products
  set status = 'available',
      reserved_until = null,
      reserved_order_id = null,
      updated_at = v_now
  where reserved_order_id = v_order.id
    and status = 'reserved';

  update public.orders
  set status = p_status, updated_at = v_now
  where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

-- Sweep lapsed reservations back to available and cancel their stale orders.
-- Safe to call from a cron job or opportunistically before reads.
create or replace function public.expire_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_released integer;
begin
  with lapsed as (
    select id from public.products
    where status = 'reserved'
      and reserved_until is not null
      and reserved_until < now()
  )
  update public.products p
  set status = 'available',
      reserved_until = null,
      reserved_order_id = null,
      updated_at = now()
  from lapsed
  where p.id = lapsed.id;

  get diagnostics v_released = row_count;

  update public.orders o
  set status = 'cancelled', updated_at = now()
  where o.status = 'awaiting_payment'
    and not exists (
      select 1 from public.products pr
      where pr.reserved_order_id = o.id and pr.status = 'reserved'
    );

  return v_released;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
--   Public (anon) may read active drops, their visible products, and the
--   store settings needed at checkout. Authenticated operators manage
--   everything. Orders are never exposed to anon; all order mutations run
--   through the SECURITY DEFINER functions above using the service role.
-- ---------------------------------------------------------------------------
alter table public.store_settings enable row level security;
alter table public.drops enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "anyone can read store settings"
on public.store_settings for select
using (true);

create policy "authenticated can update store settings"
on public.store_settings for update
to authenticated
using (true)
with check (true);

create policy "anyone can read active drops"
on public.drops for select
using (status = 'active');

create policy "authenticated can read all drops"
on public.drops for select
to authenticated
using (true);

create policy "authenticated can manage drops"
on public.drops for all
to authenticated
using (true)
with check (true);

create policy "anyone can read visible products in active drops"
on public.products for select
using (
  status <> 'hidden'
  and exists (
    select 1 from public.drops d
    where d.id = products.drop_id and d.status = 'active'
  )
);

create policy "authenticated can read all products"
on public.products for select
to authenticated
using (true);

create policy "authenticated can manage products"
on public.products for all
to authenticated
using (true)
with check (true);

create policy "authenticated can read orders"
on public.orders for select
to authenticated
using (true);

create policy "authenticated can update orders"
on public.orders for update
to authenticated
using (true)
with check (true);

create policy "authenticated can read order items"
on public.order_items for select
to authenticated
using (true);
