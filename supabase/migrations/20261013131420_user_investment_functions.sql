create or replace function public.get_my_investments()
returns table (
    investment_id uuid,
    reference text,
    plan_name text,
    amount numeric,
    roi_percentage numeric,
    expected_profit numeric,
    total_return numeric,
    duration_days integer,
    status public.investment_status,
    started_at timestamptz,
    matures_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
    select
        i.id, i.reference, i.plan_name, i.amount, i.roi_percentage,
        i.expected_profit, i.total_return, i.duration_days, i.status,
        i.started_at, i.matures_at, i.completed_at, i.cancelled_at, i.created_at
    from public.investments i
    where i.user_id = auth.uid()
    order by i.created_at desc;
$$;

revoke all on function public.get_my_investments() from public, anon;
grant execute on function public.get_my_investments() to authenticated;


-- Only active plans, only the columns a user should see.
create or replace function public.list_available_plans()
returns table (
    plan_id uuid,
    name text,
    description text,
    minimum_amount numeric,
    maximum_amount numeric,
    roi_percentage numeric,
    duration_days integer,
    image_url text
)
language sql
stable
security definer
set search_path = public
as $$
    select
        p.id, p.name, p.description, p.minimum_amount, p.maximum_amount,
        p.roi_percentage, p.duration_days, p.image_url
    from public.investment_plans p
    where p.status = 'active'
      and auth.uid() is not null
    order by p.minimum_amount asc, p.name;
$$;

revoke all on function public.list_available_plans() from public, anon;
grant execute on function public.list_available_plans() to authenticated;

notify pgrst, 'reload schema';