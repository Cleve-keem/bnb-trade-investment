create or replace function public.audit_severity(p_action text, p_status public.audit_action_status)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when p_status = 'failed' then 'Critical'
    when p_action in ('suspend_user', 'delete_user', 'delete_plan') then 'Critical'
    when p_action in (
      'admin_adjust_wallet', 'reject_withdrawal', 'cancel_investment', 'update_plan',
      'set_plan_status', 'update_settings', 'send_notification', 'delete_notification'
    ) then 'Warning'
    else 'Info'
  end;
$$;

revoke all on function public.audit_severity(text, public.audit_action_status)
  from public, anon, authenticated;


create or replace function public.admin_list_audit_logs(
  p_severity text default null,
  p_search text default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  log_id uuid,
  reference text,
  actor_id uuid,
  actor_name text,
  actor_email text,
  actor_role text,
  target_email text,
  action text,
  entity text,
  entity_id uuid,
  action_status text,
  severity text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_search text := nullif(trim(p_search), '');
  v_limit  integer := least(greatest(coalesce(p_limit, 20), 1), 100);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  if not public.is_admin() then
    raise exception 'admin_list_audit_logs: caller is not an admin';
  end if;

  return query
  select
    a.id, a.reference, a.actor_id, au.full_name::text, au.email::text, a.actor_role::text,
    tu.email::text, a.action, a.entity, a.entity_id, a.action_status::text,
    public.audit_severity(a.action, a.action_status), a.metadata, host(a.ip_address)::text,
    a.created_at, count(*) over ()
  from public.audit_logs a
  left join public.users au on au.id = a.actor_id
  left join public.users tu on tu.id = a.target_user_id
  where (p_severity is null or public.audit_severity(a.action, a.action_status) = p_severity)
    and (
      v_search is null
      or a.reference ilike '%' || v_search || '%'
      or a.action    ilike '%' || v_search || '%'
      or a.entity    ilike '%' || v_search || '%'
      or coalesce(au.email::text, '')  ilike '%' || v_search || '%'
      or coalesce(au.full_name, '')    ilike '%' || v_search || '%'
    )
  order by a.created_at desc, a.id
  limit v_limit offset v_offset;
end;
$$;


create or replace function public.admin_audit_stats()
returns table (total bigint, info bigint, warning bigint, critical bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_audit_stats: caller is not an admin';
  end if;

  return query
  select
    count(*),
    count(*) filter (where x.s = 'Info'),
    count(*) filter (where x.s = 'Warning'),
    count(*) filter (where x.s = 'Critical')
  from (
    select public.audit_severity(a.action, a.action_status) as s
    from public.audit_logs a
  ) x;
end;
$$;

revoke all on function public.admin_list_audit_logs(text, text, integer, integer) from public, anon;
revoke all on function public.admin_audit_stats() from public, anon;
grant execute on function public.admin_list_audit_logs(text, text, integer, integer) to authenticated;
grant execute on function public.admin_audit_stats() to authenticated;

notify pgrst, 'reload schema';