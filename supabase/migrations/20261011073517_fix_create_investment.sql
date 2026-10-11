-- 024_fix_create_investment.sql
create or replace function public.create_investment(
  p_plan_id  uuid,
  p_amount   numeric
)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid := auth.uid();
  v_wallet   public.wallets;
  v_plan     public.investment_plans;
  v_profit   numeric(18,2);
  v_inv      public.investments;
  v_ref      text := public.generate_reference('INV');
begin
  if v_user_id is null then
    raise exception 'create_investment: no authenticated user';
  end if;

  if public.is_maintenance_mode() then
    raise exception 'create_investment: investing is paused while the platform is under maintenance';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'create_investment: amount must be greater than zero';
  end if;

  select * into v_wallet from public.wallets where user_id = v_user_id for update;
  if not found then
    raise exception 'create_investment: wallet not found for current user';
  end if;

  select * into v_plan from public.investment_plans where id = p_plan_id for update;
  if not found or v_plan.status <> 'active' then
    raise exception 'create_investment: plan % is not available', p_plan_id;
  end if;

  if p_amount < v_plan.minimum_amount
     or (v_plan.maximum_amount is not null and p_amount > v_plan.maximum_amount) then
    raise exception 'create_investment: amount % outside plan bounds [%, %]',
      p_amount, v_plan.minimum_amount, v_plan.maximum_amount;
  end if;

  v_profit := public.calculate_roi(p_amount, v_plan.roi_percentage);

  perform public.debit_wallet(
    v_wallet.id, p_amount, 'investment_debit', v_ref, 'Invested in ' || v_plan.name, v_user_id
  );

  insert into public.investments (
    user_id, wallet_id, plan_id, reference, plan_name, duration_days, amount,
    roi_percentage, expected_profit, total_return, status, started_at, matures_at
  )
  values (
    v_user_id, v_wallet.id, p_plan_id, v_ref, v_plan.name, v_plan.duration_days, p_amount,
    v_plan.roi_percentage, v_profit, p_amount + v_profit, 'active', now(),
    public.calculate_maturity_date(now(), v_plan.duration_days)
  )
  returning * into v_inv;

  perform public.create_notification(
    v_user_id, 'Investment Successful',
    format('Your %s investment of %s is now active.', v_plan.name, p_amount),
    'investment_created'
  );

  perform public.log_audit(v_user_id, 'create_investment', 'investment', v_inv.id,
    jsonb_build_object('plan_id', p_plan_id, 'amount', p_amount, 'reference', v_ref));

  return v_inv;
end;
$$;