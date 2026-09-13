create or replace function public.block_ledger_mutation()
returns trigger
language plpgsql
as $$
declare
    v_nullable_ref_cols text[] := array['actor_id', 'target_user_id'];
    v_col text;
    v_old jsonb := to_jsonb(old);
    v_new jsonb := to_jsonb(new);
begin
    if tg_op = 'DELETE' then
        raise exception 'audit_logs is append-only. DELETE operation is not permitted.';
    end if;

    -- tg_op = 'UPDATE' from here on
    foreach v_col in array v_nullable_ref_cols loop
        if (v_old ->> v_col) is distinct from (v_new ->> v_col) then
            if v_new ->> v_col is not null then
                raise exception 'audit_logs is append-only. UPDATE operation is not permitted.';
            end if;
        end if;
        -- strip this column so the full-row comparison below ignores it
        v_old := v_old - v_col;
        v_new := v_new - v_col;
    end loop;

    if v_old is distinct from v_new then
        raise exception 'audit_logs is append-only. UPDATE operation is not permitted.';
    end if;

    return new;
end;
$$;