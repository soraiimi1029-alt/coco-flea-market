-- ブース1〜135を一括登録 (パスワード: 0000)
-- すでに存在するブース番号はスキップします

insert into public.vendors (booth_number, password_hash, store_name, profile, emoji, avatar_bg, category)
select
  n::text,
  crypt('0000', gen_salt('bf')),
  '',
  '',
  '🛍️',
  '#FFF8E1',
  'clothing'
from generate_series(1, 135) as n
on conflict (booth_number) do nothing;
