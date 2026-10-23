-- 1. The deposit instructions users may see (only these six keys, only when logged in).
--    Works whether the value column is text or jsonb.
create or replace function public.get_deposit_instructions()
returns table (setting_key text, value text)
language sql
stable
security definer
set search_path = public
as $$
  select s.setting_key::text,
         nullif(trim(to_jsonb(s.value) #>> '{}'), '')
  from public.system_settings s
  where auth.uid() is not null
    and s.setting_key::text in (
      'deposit_bank_name',
      'deposit_bank_account_name',
      'deposit_bank_account_number',
      'deposit_crypto_btc_address',
      'deposit_crypto_eth_address',
      'deposit_crypto_usdt_trc20_address'
    );
$$;

revoke all on function public.get_deposit_instructions() from public, anon;
grant execute on function public.get_deposit_instructions() to authenticated;


-- 2. request_deposit: now knows which coin, and refuses coins with no address.
--    The old versions must go first, otherwise two functions share one name.
drop function if exists public.request_deposit(numeric, public.deposit_method, text);
drop function if exists public.request_deposit(numeric, text, text, text);

create or replace function public.request_deposit(
    p_amount numeric,
    p_asset text default 'BTC',
    p_address text default null,
    p_txid text default null
)
returns public.deposit_requests
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_wallet public.wallets;
    v_asset text := upper(trim(coalesce(p_asset, '')));
    v_setting_key text;
    v_network text;
    v_address text;
    v_txid text := nullif(lower(trim(coalesce(p_txid, ''))), '');
    v_ref text;
    v_deposit public.deposit_requests;
begin
    if v_user_id is null then
        raise exception 'request_deposit: no authenticated user';
    end if;

    if not exists (select 1 from public.users where id = v_user_id and status = 'active') then
        raise exception 'request_deposit: account is not active';
    end if;

    if p_amount is null or p_amount < 10 then
        raise exception 'Minimum deposit is $10';
    end if;
    if p_amount > 1000000 then
        raise exception 'Maximum deposit is $1,000,000';
    end if;
    if round(p_amount, 2) <> p_amount then
        raise exception 'Amount can have at most 2 decimal places';
    end if;

    if v_txid is not null and v_txid !~ '^(0x)?[0-9a-f]{64}$' then
        raise exception 'Transaction ID is not valid';
    end if;

    case v_asset
        when 'BTC' then
            v_setting_key := 'deposit_crypto_btc_address';
            v_network := 'Bitcoin';
        when 'ETH' then
            v_setting_key := 'deposit_crypto_eth_address';
            v_network := 'Ethereum';
        when 'USDT' then
            v_setting_key := 'deposit_crypto_usdt_trc20_address';
            v_network := 'TRON (TRC-20)';
        else
            raise exception 'Unsupported currency';
    end case;

    select nullif(trim(to_jsonb(s.value) #>> '{}'), '')
    into v_address
    from public.system_settings s
    where s.setting_key::text = v_setting_key;

    if v_address is null then
        raise exception '% deposits are not available yet', v_asset;
    end if;

    -- The user must have been shown the address we have now
    if coalesce(trim(p_address), '') <> v_address then
        raise exception 'The deposit address was updated. Please start again to get the new address.';
    end if;

    -- Lock the wallet so two quick clicks can't slip past the limit below
    select * into v_wallet from public.wallets where user_id = v_user_id for update;
    if not found then
        raise exception 'request_deposit: wallet not found';
    end if;
    if v_wallet.status <> 'active' then
        raise exception 'request_deposit: wallet is not active';
    end if;

    if (
        select count(*) from public.deposit_requests
        where user_id = v_user_id and status = 'pending'
    ) >= 3 then
        raise exception 'You already have 3 deposits waiting for confirmation. Please wait for them to be reviewed.';
    end if;

    v_ref := public.generate_reference('DEP');

    begin
        insert into public.deposit_requests (
            user_id, wallet_id, reference, amount, currency, method, status, metadata
        )
        values (
            v_user_id, v_wallet.id, v_ref, p_amount, v_wallet.currency, 'crypto', 'pending',
            jsonb_strip_nulls(jsonb_build_object(
                'asset', v_asset,
                'network', v_network,
                'address', v_address,
                'txid', v_txid
            ))
        )
        returning * into v_deposit;
    exception
        when unique_violation then
            raise exception 'This transaction ID was already submitted';
    end;

    perform public.log_audit(
        v_user_id, 'request_deposit', 'deposit_request', v_deposit.id,
        jsonb_build_object('amount', p_amount, 'asset', v_asset,
                           'reference', v_ref, 'txid', v_txid)
    );

    return v_deposit;
end;
$$;

-- The same transaction can't be used twice (a rejected request frees it up)
create unique index if not exists deposit_requests_txid_unique
on public.deposit_requests ((metadata->>'txid'))
where (metadata->>'txid') is not null and status <> 'failed';

revoke all on function public.request_deposit(numeric, text, text, text) from public, anon;
grant execute on function public.request_deposit(numeric, text, text, text) to authenticated;


-- 3. Admin list now shows which coin and which address the user was given
drop function if exists public.admin_list_deposits();

create or replace function public.admin_list_deposits()
returns table (
    deposit_id uuid,
    reference text,
    user_id uuid,
    full_name text,
    email citext,
    amount numeric,
    currency text,
    asset text,
    address text,
    method public.deposit_method,
    status public.deposit_status,
    txid text,
    rejection_reason text,
    created_at timestamptz,
    decided_at timestamptz,
    decided_by_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    if not public.is_admin() then
        raise exception 'admin_list_deposits: caller is not an admin';
    end if;

    return query
    select
        d.id, d.reference, d.user_id, u.full_name, u.email,
        d.amount, d.currency::text,
        (d.metadata->>'asset'), (d.metadata->>'address'),
        d.method, d.status,
        (d.metadata->>'txid'), d.rejection_reason,
        d.created_at, d.decided_at, a.full_name
    from public.deposit_requests d
    join public.users u on u.id = d.user_id
    left join public.users a on a.id = d.decision_by
    order by d.created_at desc;
end;
$$;

revoke all on function public.admin_list_deposits() from public, anon;
grant execute on function public.admin_list_deposits() to authenticated;

notify pgrst, 'reload schema';