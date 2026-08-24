-- 全出店者のアイコンを初期状態に戻す(一括)
-- SQL Editorに貼って実行してください。
-- ※ アップロード済みの画像ファイル自体はストレージに残りますが、
--   紐付け(avatar_url)だけを外すので、表示は初期アイコンに戻ります。

update public.vendors set avatar_url = null;
