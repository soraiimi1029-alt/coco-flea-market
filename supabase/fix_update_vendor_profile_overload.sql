-- プロフィール更新の関数(update_vendor_profile)の古いバージョンが
-- データベース内に残ってしまっていたため削除します。
-- (アイコン画像対応を追加した際、引数の数が変わったため
--  古い5個版と新しい6個版が両方残ってしまっていました)
-- 今回は実害はありませんでしたが、念のため古い方を削除して整理します。
-- SQL Editorで実行してください。

drop function if exists public.update_vendor_profile(text, text, text, text, text);
