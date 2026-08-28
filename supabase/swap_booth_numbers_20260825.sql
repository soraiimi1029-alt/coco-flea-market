-- ブース番号の入れ替え(2026-08-25)
-- 95<->97, 104->106->105->104(3者ローテーション), 107->109->108->107(3者ローテーション)
-- SQL Editorに貼って実行してください。

begin;

-- 衝突を避けるため、一旦仮の番号に退避
update public.vendors set booth_number = 'tmp95'  where booth_number = '95';
update public.vendors set booth_number = 'tmp97'  where booth_number = '97';
update public.vendors set booth_number = 'tmp104' where booth_number = '104';
update public.vendors set booth_number = 'tmp105' where booth_number = '105';
update public.vendors set booth_number = 'tmp106' where booth_number = '106';
update public.vendors set booth_number = 'tmp107' where booth_number = '107';
update public.vendors set booth_number = 'tmp108' where booth_number = '108';
update public.vendors set booth_number = 'tmp109' where booth_number = '109';

-- 新しい番号を確定
update public.vendors set booth_number = '97'  where booth_number = 'tmp95';   -- MONC: 95->97
update public.vendors set booth_number = '95'  where booth_number = 'tmp97';   -- さらももみずゆな: 97->95
update public.vendors set booth_number = '106' where booth_number = 'tmp104';  -- emi: 104->106
update public.vendors set booth_number = '104' where booth_number = 'tmp105';  -- アトムニキ少女あべそ: 105->104
update public.vendors set booth_number = '105' where booth_number = 'tmp106';  -- MIKI♡AMARA: 106->105
update public.vendors set booth_number = '109' where booth_number = 'tmp107';  -- スミリッサモリリン: 107->109
update public.vendors set booth_number = '108' where booth_number = 'tmp109';  -- 仲良しブラザーズ: 109->108
update public.vendors set booth_number = '107' where booth_number = 'tmp108';  -- ※Mare: 108->107

commit;
