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

-- ---------------------------------------------------------------------------
-- SHAWN Apparel storefront sample data: one active drop of one of one pieces.
-- ---------------------------------------------------------------------------
update public.store_settings
set delivery_fee = 350,
    whatsapp_number = '254700000000',
    support_email = 'hello@shawn.co.ke'
where id = true;

insert into public.drops (id, title, slug, description, status, launch_date, sort_order)
values (
  '11111111-1111-1111-1111-111111111111',
  'The First Edit',
  'the-first-edit',
  'A short edit of considered pieces, each one of a kind. Found, restored, and made to be kept.',
  'active',
  now(),
  1
)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    status = excluded.status,
    launch_date = excluded.launch_date;

insert into public.products
  (drop_id, title, slug, description, price, size, category, condition, measurements, image_color, status, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'Relaxed Wool Trouser in Stone', 'relaxed-wool-trouser-stone',
   'Cut for ease in a soft warm wool. A quiet essential, made to last and to layer through the season.',
   4200, 'M', 'Trousers', 'Excellent, gently worn',
   '{"Waist":"78 cm","Inseam":"74 cm","Rise":"30 cm"}'::jsonb, '#C3B6A2', 'available', 1),
  ('11111111-1111-1111-1111-111111111111', 'Ivory Silk Blouse', 'ivory-silk-blouse',
   'A fluid silk blouse in warm ivory. Understated, considered, and easy to wear from day into evening.',
   3800, 'S', 'Tops', 'Excellent, gently worn',
   '{"Chest":"96 cm","Length":"62 cm","Sleeve":"58 cm"}'::jsonb, '#EFE6D6', 'available', 2),
  ('11111111-1111-1111-1111-111111111111', 'Espresso Wool Overcoat', 'espresso-wool-overcoat',
   'A deep warm brown overcoat with a clean line. Weighted, timeless, and made to be kept for years.',
   9500, 'L', 'Outerwear', 'Very good, light wear',
   '{"Chest":"112 cm","Length":"104 cm","Shoulder":"46 cm"}'::jsonb, '#4A3A2E', 'available', 3),
  ('11111111-1111-1111-1111-111111111111', 'Olive Linen Shirt Dress', 'olive-linen-shirt-dress',
   'A soft olive linen dress that moves easily. Relaxed through the body with a considered collar.',
   5200, 'M', 'Dresses', 'Excellent, gently worn',
   '{"Chest":"100 cm","Length":"118 cm","Waist":"Relaxed"}'::jsonb, '#6E6B4E', 'available', 4),
  ('11111111-1111-1111-1111-111111111111', 'Sand Cashmere Knit', 'sand-cashmere-knit',
   'A warm sand cashmere knit with a gentle hand. The kind of piece you reach for first.',
   6400, 'S', 'Knitwear', 'Excellent, gently worn',
   '{"Chest":"94 cm","Length":"60 cm","Sleeve":"60 cm"}'::jsonb, '#E2D3BC', 'sold', 5),
  ('11111111-1111-1111-1111-111111111111', 'Charcoal Tailored Blazer', 'charcoal-tailored-blazer',
   'A structured blazer in near black charcoal. Sharp shoulders, soft drape, quietly confident.',
   8800, 'M', 'Outerwear', 'Very good, light wear',
   '{"Chest":"104 cm","Length":"72 cm","Shoulder":"42 cm"}'::jsonb, '#2B2723', 'available', 6)
on conflict (slug) do nothing;
