-- 全出店者の「アイコン・Instagram・プロフィール文・カテゴリー」を一括で初期化
-- SQL Editorに貼って実行してください。
-- ※ 店名・パスワードはそのまま残ります。

update public.vendors set
  avatar_url = null,
  instagram = null,
  profile = '',
  category = 'clothing';
