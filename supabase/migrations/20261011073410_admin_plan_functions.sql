-- =============================================================================
-- 023_admin_plan_functions.sql
-- =============================================================================

-- Shared validation for create + update. Internal: not callable from the browser.
create or replace function public.assert_valid_plan(
    p_name text,
    p_minimum numeric,
    p_maximum numeric,
    p_roi numeric,
    p_days integer
)
returns void
language plpgsql
set search_path = public
as $$
begin
    if coalesce(trim(p_name), '') = '' then
        raise exception 'Plan name is required';
    end if;
    if p_minimum is null or p_minimum <= 0 then
        raise exception 'Minimum investment must be greater than zero';
    end if;
    if p_maximum is not null and p_maximum < p_minimum then
        raise exception 'Maximum investment can''t be lower than the minimum';
    end if;
    if p_roi is null or p_roi <= 0 or p_roi > 100 then
        raise exception 'ROI must be greater than 0 and at most 100';
    end if;
    if p_days is null or p_days < 1 then
        raise exception 'Duration must be at least 1 day';
    end if;
end;
$$;

revoke all on function public.assert_valid_plan(text, numeric, numeric, numeric, integer)
    from public, anon, authenticated;


-- List every plan with live usage numbers.
-- investor_count / invested_amount cover current positions (active + pending).
-- lifetime_investments counts everything, so the UI knows if a plan is deletable.
create or replace function public.admin_list_plans()
returns table (
    plan_id uuid,
    name text,
    description text,
    minimum_amount numeric,
    maximum_amount numeric,
    roi_percentage numeric,
    duration_days integer,
    status public.plan_status,
    investor_count bigint,
    invested_amount numeric,
    lifetime_investments bigint,
    created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_plans: caller is not an admin';
    end if;

    return query
    select
        p.id,
        p.name,
        p.description,
        p.minimum_amount,
        p.maximum_amount,
        p.roi_percentage,
        p.duration_days,
        p.status,
        count(distinct i.user_id) filter (where i.status in ('active', 'pending')),
        coalesce(sum(i.amount) filter (where i.status in ('active', 'pending')), 0),
        count(i.id),
        p.created_at
    from public.investment_plans p
    left join public.investments i on i.plan_id = p.id
    group by p.id
    order by p.created_at desc, p.name;
end;
$$;


create or replace function public.admin_create_plan(
    p_name text,
    p_description text,
    p_minimum_amount numeric,
    p_maximum_amount numeric,
    p_roi_percentage numeric,
    p_duration_days integer,
    p_status public.plan_status default 'active'
)
returns public.investment_plans
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_name text := trim(coalesce(p_name, ''));
    v_plan public.investment_plans;
begin
    if not public.is_admin() then
        raise exception 'admin_create_plan: caller is not an admin';
    end if;

    perform public.assert_valid_plan(
        v_name, p_minimum_amount, p_maximum_amount, p_roi_percentage, p_duration_days
    );

    if p_status = 'archived' then
        raise exception 'A new plan can''t start out archived';
    end if;

    begin
        insert into public.investment_plans (
            name, description, minimum_amount, maximum_amount,
            roi_percentage, duration_days, status, created_by
        )
        values (
            v_name, nullif(trim(coalesce(p_description, '')), ''),
            p_minimum_amount, p_maximum_amount,
            p_roi_percentage, p_duration_days, p_status, v_admin_id
        )
        returning * into v_plan;
    exception
        when unique_violation then
            raise exception 'A plan named "%" already exists', v_name;
    end;

    perform public.log_audit(
        v_admin_id, 'create_plan', 'investment_plan', v_plan.id,
        jsonb_build_object(
            'name', v_plan.name,
            'roi_percentage', v_plan.roi_percentage,
            'duration_days', v_plan.duration_days,
            'status', v_plan.status
        )
    );

    return v_plan;
end;
$$;


-- Existing investments keep their snapshot terms; only new ones use the edit.
create or replace function public.admin_update_plan(
    p_plan_id uuid,
    p_name text,
    p_description text,
    p_minimum_amount numeric,
    p_maximum_amount numeric,
    p_roi_percentage numeric,
    p_duration_days integer
)
returns public.investment_plans
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_name text := trim(coalesce(p_name, ''));
    v_before public.investment_plans;
    v_plan public.investment_plans;
begin
    if not public.is_admin() then
        raise exception 'admin_update_plan: caller is not an admin';
    end if;

    perform public.assert_valid_plan(
        v_name, p_minimum_amount, p_maximum_amount, p_roi_percentage, p_duration_days
    );

    select * into v_before from public.investment_plans where id = p_plan_id for update;
    if not found then
        raise exception 'That plan no longer exists';
    end if;

    begin
        update public.investment_plans
        set name = v_name,
            description = nullif(trim(coalesce(p_description, '')), ''),
            minimum_amount = p_minimum_amount,
            maximum_amount = p_maximum_amount,
            roi_percentage = p_roi_percentage,
            duration_days = p_duration_days
        where id = p_plan_id
        returning * into v_plan;
    exception
        when unique_violation then
            raise exception 'A plan named "%" already exists', v_name;
    end;

    perform public.log_audit(
        v_admin_id, 'update_plan', 'investment_plan', v_plan.id,
        jsonb_build_object('before', to_jsonb(v_before), 'after', to_jsonb(v_plan))
    );

    return v_plan;
end;
$$;


create or replace function public.admin_set_plan_status(
    p_plan_id uuid,
    p_status public.plan_status
)
returns public.investment_plans
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_plan public.investment_plans;
begin
    if not public.is_admin() then
        raise exception 'admin_set_plan_status: caller is not an admin';
    end if;

    update public.investment_plans
    set status = p_status
    where id = p_plan_id
    returning * into v_plan;

    if not found then
        raise exception 'That plan no longer exists';
    end if;

    perform public.log_audit(
        v_admin_id, 'set_plan_status', 'investment_plan', v_plan.id,
        jsonb_build_object('name', v_plan.name, 'status', p_status)
    );

    return v_plan;
end;
$$;


-- Only plans that were never invested in can be deleted. Everything else is
-- archived, because investments.plan_id is ON DELETE RESTRICT.
create or replace function public.admin_delete_plan(p_plan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_admin_id uuid := auth.uid();
    v_plan public.investment_plans;
begin
    if not public.is_admin() then
        raise exception 'admin_delete_plan: caller is not an admin';
    end if;

    select * into v_plan from public.investment_plans where id = p_plan_id for update;
    if not found then
        raise exception 'That plan no longer exists';
    end if;

    if exists (select 1 from public.investments where plan_id = p_plan_id) then
        raise exception 'This plan has investments and can''t be deleted. Archive it instead.';
    end if;

    delete from public.investment_plans where id = p_plan_id;

    perform public.log_audit(
        v_admin_id, 'delete_plan', 'investment_plan', p_plan_id,
        jsonb_build_object('name', v_plan.name)
    );
end;
$$;


revoke all on function public.admin_list_plans() from public, anon;
revoke all on function public.admin_create_plan(text, text, numeric, numeric, numeric, integer, public.plan_status) from public, anon;
revoke all on function public.admin_update_plan(uuid, text, text, numeric, numeric, numeric, integer) from public, anon;
revoke all on function public.admin_set_plan_status(uuid, public.plan_status) from public, anon;
revoke all on function public.admin_delete_plan(uuid) from public, anon;

grant execute on function public.admin_list_plans() to authenticated;
grant execute on function public.admin_create_plan(text, text, numeric, numeric, numeric, integer, public.plan_status) to authenticated;
grant execute on function public.admin_update_plan(uuid, text, text, numeric, numeric, numeric, integer) to authenticated;
grant execute on function public.admin_set_plan_status(uuid, public.plan_status) to authenticated;
grant execute on function public.admin_delete_plan(uuid) to authenticated;

notify pgrst, 'reload schema';