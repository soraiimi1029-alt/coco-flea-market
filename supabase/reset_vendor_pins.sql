-- 既存のテスト出店者のパスワードを4桁PIN「0000」に統一します
-- (今までの "flea2026" のような長いパスワードはPIN入力に対応していないため)
-- SQL Editorで実行してください。実行後は出店者ログインのパスワードは全員 0000 になります。

update public.vendors set password_hash = crypt('0000', gen_salt('bf'));
