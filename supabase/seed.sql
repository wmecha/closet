insert into public.scenario_templates (name, description, data)
values (
  'First Meru Ladies Drop',
  'Editable starting assumptions for a KES 50,000 first sourcing trip.',
  '{
    "totalCapital": 50000,
    "plannedStockBudget": 32500,
    "targetPricingMethod": "markup",
    "targetRatePercent": 120,
    "expectedSellThroughPercent": 85,
    "priceRounding": "nearest_50"
  }'::jsonb
)
on conflict (name) do update
set description = excluded.description, data = excluded.data;
