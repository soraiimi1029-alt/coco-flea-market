-- 来場者の性別データ収集用SQL
-- SQL Editorに貼って実行してください。

create table public.visitor_demographics (
  device_id text primary key,
  gender text not null check (gender in ('male', 'female', 'other', 'no_answer')),
  created_at timestamptz not null default now()
);

alter table public.visitor_demographics enable row level security;

create or replace function public.submit_visitor_gender(p_device_id text, p_gender text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into public.visitor_demographics (device_id, gender)
    values (p_device_id, p_gender)
  on conflict (device_id) do update set gender = excluded.gender;
  return true;
end; $$;
grant execute on function public.submit_visitor_gender(text, text) to anon;

create or replace function public.admin_gender_stats(p_admin_id text, p_password text)
returns table (gender text, count bigint)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  return query
    select vd.gender, count(*) as count
    from public.visitor_demographics vd
    group by vd.gender;
end; $$;
grant execute on function public.admin_gender_stats(text, text) to anon;
