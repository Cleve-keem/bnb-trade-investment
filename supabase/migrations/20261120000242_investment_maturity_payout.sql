-- 1. investments.updated_at was never updated automatically
drop trigger if exists investments_set_updated_at on public.investments;
create trigger investments_set_updated_at
before update on public.investments
for each row execute function public.set_updated_at();


-- 2. Pay one matured investment (safe to call twice)
--    Fixes: descriptions use the readable reference, a zero profit no longer
--    breaks the payout, updated_at is set, and time is compared with now().
create or replace function public.complete_investment(p_investment_id uuid)
returns public.investments
language plpgsql
security definer
set search_path = public
as $$
declare
    v_inv      public.investments;
    v_wallet   public.wallets;
    v_now      timestamptz := now();
    v_ref_ret  text;
    v_ref_prof text;
begin
    select * into v_inv
    from public.investments
    where id = p_investment_id
    for update;

    if not found then
        raise exception 'complete_investment: investment % not found', p_investment_id;
    end if;

    -- Already paid: do nothing, so a double run can never pay twice
    if v_inv.status = 'completed' then
        return v_inv;
    end if;

    if v_inv.status <> 'active' then
        raise exception 'complete_investment: investment % is not active (status=%)',
            p_investment_id, v_inv.status;
    end if;

    if v_inv.matures_at is null or v_inv.matures_at > v_now then
        raise exception 'complete_investment: investment % has not matured yet', p_investment_id;
    end if;

    select * into v_wallet from public.wallets where id = v_inv.wallet_id for update;
    if not found then
        raise exception 'complete_investment: wallet % not found', v_inv.wallet_id;
    end if;
    if v_wallet.status <> 'active' then
        raise exception 'complete_investment: wallet % is not active (status=%), cannot pay out',
            v_wallet.id, v_wallet.status;
    end if;

    -- Principal back to the wallet
    v_ref_ret := public.generate_reference('INVRET');
    perform public.credit_wallet(
        v_inv.wallet_id, v_inv.amount, 'investment_return',
        v_ref_ret, 'Principal returned for investment ' || v_inv.reference, null
    );

    -- Profit to the wallet (skipped if it is zero)
    if v_inv.expected_profit > 0 then
        v_ref_prof := public.generate_reference('PROFIT');
        perform public.credit_wallet(
            v_inv.wallet_id, v_inv.expected_profit, 'profit_payout',
            v_ref_prof, 'Profit payout for investment ' || v_inv.reference, null
        );
    end if;

    update public.investments
    set status = 'completed', completed_at = v_now
    where id = p_investment_id
    returning * into v_inv;

    perform public.create_notification(
        v_inv.user_id,
        'Investment Matured',
        format('Your %s investment has matured. %s USD has been credited to your wallet.',
               v_inv.plan_name, to_char(v_inv.total_return, 'FM999,999,999,990.00')),
        'investment_matured'
    );

    perform public.log_audit(
        null, 'complete_investment', 'investment', v_inv.id,
        jsonb_build_object(
            'reference', v_inv.reference,
            'user_id', v_inv.user_id,
            'total_return', v_inv.total_return,
            'principal_reference', v_ref_ret,
            'profit_reference', v_ref_prof
        )
    );

    return v_inv;
end;
$$;


-- 3. Pay every matured investment (this is what the scheduled job calls)
create or replace function public.complete_matured_investments(p_limit integer default 200)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_id uuid;
    v_done integer := 0;
begin
    for v_id in
        select i.id
        from public.investments i
        where i.status = 'active'
          and i.matures_at is not null
          and i.matures_at <= now()
        order by i.matures_at
        limit least(greatest(coalesce(p_limit, 200), 1), 1000)
        for update skip locked
    loop
        begin
            perform public.complete_investment(v_id);
            v_done := v_done + 1;
        exception
            when others then
                -- One bad investment (for example a frozen wallet) must not stop the others.
                -- Record the failure once per hour, so the audit log doesn't fill up.
                if not exists (
                    select 1 from public.audit_logs a
                    where a.action = 'complete_investment'
                      and a.entity_id = v_id
                      and a.action_status = 'failed'
                      and a.created_at > now() - interval '1 hour'
                ) then
                    insert into public.audit_logs (
                        reference, actor_id, target_user_id, action, entity,
                        entity_id, action_status, metadata
                    )
                    values (
                        'AUD-' || upper(replace(gen_random_uuid()::text, '-', '')),
                        null,
                        (select user_id from public.investments where id = v_id),
                        'complete_investment', 'investment', v_id, 'failed',
                        jsonb_build_object('error', sqlerrm)
                    );
                end if;
        end;
    end loop;

    return v_done;
end;
$$;


-- 4. Only the database itself and your server can run these, never a browser
revoke all on function public.complete_investment(uuid) from public, anon, authenticated;
revoke all on function public.complete_matured_investments(integer) from public, anon, authenticated;
grant execute on function public.complete_investment(uuid) to service_role;
grant execute on function public.complete_matured_investments(integer) to service_role;

notify pgrst, 'reload schema';