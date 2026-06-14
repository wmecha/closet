insert into public.scenario_templates (name, description, data)
values (
  'First Meru Ladies Drop',
  'Editable 50-piece starter plan using a KES 100-200 buying range and KES 150 average cost.',
  '{
    "totalCapital": 50000,
    "plannedStockBudget": 7500,
    "mode": "quantity",
    "targetPricingMethod": "markup",
    "targetRatePercent": 50,
    "expectedSellThroughPercent": 90,
    "priceRounding": "nearest_50"
  }'::jsonb
)
on conflict (name) do update
set description = excluded.description, data = excluded.data;
