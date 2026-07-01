-- 修正用SQL: Supabaseではpgcryptoが"extensions"スキーマに入るため、
-- 各関数のsearch_pathに"extensions"を追加します。
-- SQL Editorに貼って実行してください。

alter function public.vendor_login(text, text) set search_path = public, extensions;
alter function public.update_vendor_profile(text, text, text, text, text) set search_path = public, extensions;
alter function public.create_product(text, text, text, integer, text, text, text) set search_path = public, extensions;
alter function public.update_product(text, text, uuid, text, integer, text, text, text, boolean) set search_path = public, extensions;
alter function public.delete_product(text, text, uuid) set search_path = public, extensions;
alter function public.admin_login(text, text) set search_path = public, extensions;
alter function public.admin_list_vendors(text, text) set search_path = public, extensions;
alter function public.admin_create_vendor(text, text, text, text, text, text) set search_path = public, extensions;
alter function public.admin_set_vendor_password(text, text, uuid, text) set search_path = public, extensions;

-- ブース番号を「A-05」のような表記から、実際のイベントに合わせた1〜135の数字に変更
update public.vendors set booth_number = '12' where booth_number = 'B-12';
update public.vendors set booth_number = '5'  where booth_number = 'A-05';
update public.vendors set booth_number = '8'  where booth_number = 'C-08';
update public.vendors set booth_number = '3'  where booth_number = 'D-03';
update public.vendors set booth_number = '1'  where booth_number = 'E-01';
update public.vendors set booth_number = '2'  where booth_number = 'E-02';
