alter table public.scenario_categories
  add column if not exists min_buying_price integer not null default 0
    check (min_buying_price >= 0),
  add column if not exists max_buying_price integer not null default 0
    check (max_buying_price >= 0);

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
      id, scenario_id, name, budget, quantity, min_buying_price,
      average_buying_price, max_buying_price, online_price, market_price,
      clearance_price, online_percent, market_percent, clearance_percent,
      discount_percent, damaged_percent, unsold_percent, priority, data,
      sort_order
    ) values (
      (item ->> 'id')::uuid,
      new.id,
      item ->> 'name',
      greatest(0, coalesce((item ->> 'budget')::integer, 0)),
      greatest(0, coalesce((item ->> 'quantity')::integer, 0)),
      greatest(0, coalesce((item ->> 'minBuyingPrice')::integer, 0)),
      greatest(0, coalesce((item ->> 'averageBuyingPrice')::integer, 0)),
      greatest(0, coalesce((item ->> 'maxBuyingPrice')::integer, 0)),
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
