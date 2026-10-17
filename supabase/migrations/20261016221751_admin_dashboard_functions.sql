-- Chart: total invested (cancelled excluded) up to the end of each day or month
create or replace function public.admin_overview_series(p_range text default '7M')
returns table (label text, bucket_end timestamptz, value numeric)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_daily boolean;
begin
  if not public.is_admin() then
    raise exception 'admin_overview_series: caller is not an admin';
  end if;

  case p_range
    when '30D' then v_count := 30; v_daily := true;
    when '7M'  then v_count := 7;  v_daily := false;
    when '12M' then v_count := 12; v_daily := false;
    else raise exception 'admin_overview_series: invalid range %', p_range;
  end case;

  return query
  select
    case when v_daily then to_char(p.ts, 'Mon DD') else to_char(p.ts, 'Mon') end,
    p.ts,
    coalesce((
      select sum(i.amount)
      from public.investments i
      where i.status <> 'cancelled'
        and i.started_at is not null
        and i.started_at <= p.ts
    ), 0)
  from (
    select least(
      now(),
      case when v_daily
        then date_trunc('day', now())   - (n * interval '1 day')   + interval '1 day'   - interval '1 second'
        else date_trunc('month', now()) - (n * interval '1 month') + interval '1 month' - interval '1 second'
      end
    ) as ts
    from generate_series(v_count - 1, 0, -1) as n
  ) p
  order by p.ts;
end;
$$;


-- One list for everything an admin needs to act on
create or replace function public.admin_list_pending(
  p_limit integer default 10,
  p_kinds text[] default null,
  p_oldest_first boolean default false
)
returns table (
  kind text,
  item_id uuid,
  reference text,
  user_id uuid,
  full_name text,
  email text,
  amount numeric,
  title text,
  status text,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 10), 1), 50);
begin
  if not public.is_admin() then
    raise exception 'admin_list_pending: caller is not an admin';
  end if;

  return query
  with items as (
    select 'withdrawal'::text as kind, r.id as item_id, r.reference::text as reference,
           r.user_id as user_id, u.full_name::text as full_name, u.email::text as email,
           r.amount::numeric as amount,
           (coalesce(r.asset, 'Crypto') || ' withdrawal')::text as title,
           r.status::text as status, r.created_at as created_at
    from public.withdrawal_requests r
    join public.users u on u.id = r.user_id
    where r.status::text in ('pending', 'approved')

    union all

    select 'deposit', d.id, d.reference::text, d.user_id, u.full_name::text, u.email::text,
           d.amount::numeric, 'Deposit request', d.status::text, d.created_at
    from public.deposit_requests d
    join public.users u on u.id = d.user_id
    where d.status::text = 'pending'

    union all

    select 'support', c.id, null::text, c.user_id, u.full_name::text, u.email::text,
           null::numeric, coalesce(c.last_message_preview, 'New message')::text,
           c.status::text, c.last_message_at
    from public.support_conversations c
    join public.users u on u.id = c.user_id
    where c.status = 'open'
      and exists (
        select 1 from public.support_messages m
        where m.conversation_id = c.id
          and m.sender_role = 'user'
          and m.read_at is null
      )
  )
  select i.kind, i.item_id, i.reference, i.user_id, i.full_name, i.email,
         i.amount, i.title, i.status, i.created_at,
         count(*) over ()
  from items i
  where p_kinds is null or i.kind = any(p_kinds)
  order by
    case when p_oldest_first then i.created_at end asc nulls last,
    case when not p_oldest_first then i.created_at end desc nulls last
  limit v_limit;
end;
$$;

revoke all on function public.admin_overview_series(text) from public, anon;
revoke all on function public.admin_list_pending(integer, text[], boolean) from public, anon;
grant execute on function public.admin_overview_series(text) to authenticated;
grant execute on function public.admin_list_pending(integer, text[], boolean) to authenticated;

notify pgrst, 'reload schema';