-- Internal: write one automatic message into a chat
create or replace function public.support_post_auto_reply(
  p_conversation_id uuid,
  p_user_id uuid,
  p_rule_id uuid,
  p_reply text
)
returns void
language sql
security definer
set search_path = public
as $$
  -- clock_timestamp() so it sorts after the customer's message in the same request
  insert into public.support_messages (
    conversation_id, user_id, sender_id, sender_role, body,
    read_at, auto_reply_id, created_at
  )
  values (
    p_conversation_id, p_user_id, null, 'system', p_reply,
    clock_timestamp(), p_rule_id, clock_timestamp()
  );
$$;

revoke all on function public.support_post_auto_reply(uuid, uuid, uuid, text)
  from public, anon, authenticated;


-- Internal: decide which automatic reply (if any) to send
create or replace function public.support_auto_reply(
  p_conversation_id uuid,
  p_user_id uuid,
  p_body text,
  p_new_session boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text := lower(coalesce(p_body, ''));
  v_rule public.support_auto_replies;
  v_sent boolean := false;
begin
  -- A person on the team is already chatting: stay quiet
  if exists (
    select 1 from public.support_messages m
    where m.conversation_id = p_conversation_id
      and m.sender_role = 'admin'
      and m.created_at > now() - interval '10 minutes'
  ) then
    return;
  end if;

  -- 1. Greeting for a new conversation
  if p_new_session then
    select r.* into v_rule
    from public.support_auto_replies r
    where r.kind = 'greeting' and r.is_active
      and not exists (
        select 1 from public.support_messages m
        where m.conversation_id = p_conversation_id
          and m.auto_reply_id = r.id
          and m.created_at > now() - interval '1 hour'
      )
    order by r.sort_order, r.created_at
    limit 1;

    if found then
      perform public.support_post_auto_reply(p_conversation_id, p_user_id, v_rule.id, v_rule.reply);
      v_sent := true;
    end if;
  end if;

  -- 2. Keyword answer
  select r.* into v_rule
  from public.support_auto_replies r
  where r.kind = 'faq' and r.is_active
    and exists (
      select 1 from unnest(r.keywords) k
      where length(k) > 0 and position(lower(k) in v_text) > 0
    )
    and not exists (
      select 1 from public.support_messages m
      where m.conversation_id = p_conversation_id
        and m.auto_reply_id = r.id
        and m.created_at > now() - interval '1 hour'
    )
  order by r.sort_order, r.created_at
  limit 1;

  if found then
    perform public.support_post_auto_reply(p_conversation_id, p_user_id, v_rule.id, v_rule.reply);
    return;
  end if;

  -- 3. Fallback, only if nothing else was sent
  if not v_sent then
    select r.* into v_rule
    from public.support_auto_replies r
    where r.kind = 'fallback' and r.is_active
      and not exists (
        select 1 from public.support_messages m
        where m.conversation_id = p_conversation_id
          and m.auto_reply_id = r.id
          and m.created_at > now() - interval '1 hour'
      )
    order by r.sort_order, r.created_at
    limit 1;

    if found then
      perform public.support_post_auto_reply(p_conversation_id, p_user_id, v_rule.id, v_rule.reply);
    end if;
  end if;
end;
$$;

revoke all on function public.support_auto_reply(uuid, uuid, text, boolean)
  from public, anon, authenticated;


-- Customer sends a message (replaces the version from the chat setup)
create or replace function public.send_my_support_message(p_body text)
returns public.support_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_body text := trim(coalesce(p_body, ''));
  v_prev_status text;
  v_conv public.support_conversations;
  v_msg  public.support_messages;
begin
  if v_user is null then
    raise exception 'send_my_support_message: no authenticated user';
  end if;

  if v_body = '' or length(v_body) > 2000 then
    raise exception 'send_my_support_message: message must be 1 to 2000 characters';
  end if;

  if not exists (select 1 from public.users where id = v_user and status = 'active') then
    raise exception 'send_my_support_message: account is not active';
  end if;

  -- Rate limit: 20 messages per 5 minutes
  if (
    select count(*) from public.support_messages
    where user_id = v_user
      and sender_role = 'user'
      and created_at > now() - interval '5 minutes'
  ) >= 20 then
    raise exception 'You are sending messages too quickly. Please wait a moment.';
  end if;

  select status into v_prev_status
  from public.support_conversations where user_id = v_user;

  insert into public.support_conversations (user_id, last_message_at, last_message_preview)
  values (v_user, timezone('utc', now()), left(v_body, 120))
  on conflict (user_id) do update
    set status = 'open',
        last_message_at = excluded.last_message_at,
        last_message_preview = excluded.last_message_preview
  returning * into v_conv;

  insert into public.support_messages (conversation_id, user_id, sender_id, sender_role, body)
  values (v_conv.id, v_user, v_user, 'user', v_body)
  returning * into v_msg;

  perform public.support_auto_reply(
    v_conv.id, v_user, v_body,
    v_prev_status is null or v_prev_status = 'closed'
  );

  return v_msg;
end;
$$;


-- Admin: list, save, delete
create or replace function public.admin_list_auto_replies()
returns setof public.support_auto_replies
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_list_auto_replies: caller is not an admin';
  end if;

  return query
  select * from public.support_auto_replies
  order by case kind when 'greeting' then 1 when 'faq' then 2 else 3 end,
           sort_order, created_at;
end;
$$;


create or replace function public.admin_save_auto_reply(
  p_id uuid,
  p_name text,
  p_kind text,
  p_keywords text[],
  p_reply text,
  p_is_active boolean,
  p_sort_order integer default 100
)
returns public.support_auto_replies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_name text := trim(coalesce(p_name, ''));
  v_reply text := trim(coalesce(p_reply, ''));
  v_keywords text[];
  v_row public.support_auto_replies;
begin
  if not public.is_admin() then
    raise exception 'admin_save_auto_reply: caller is not an admin';
  end if;

  if v_name = '' or length(v_name) > 80 then
    raise exception 'Name must be 1 to 80 characters';
  end if;
  if v_reply = '' or length(v_reply) > 1000 then
    raise exception 'Reply must be 1 to 1000 characters';
  end if;
  if p_kind not in ('greeting', 'faq', 'fallback') then
    raise exception 'Invalid type';
  end if;

  -- Clean the keywords: lowercase, no duplicates, at least 3 letters each
  select coalesce(array_agg(distinct lower(trim(k))), '{}')
  into v_keywords
  from unnest(coalesce(p_keywords, '{}')) k
  where length(trim(k)) >= 3;

  if p_kind = 'faq' then
    if cardinality(v_keywords) = 0 then
      raise exception 'Add at least one keyword (3 or more letters)';
    end if;
  else
    v_keywords := '{}';
  end if;

  begin
    if p_id is null then
      insert into public.support_auto_replies
        (name, kind, keywords, reply, is_active, sort_order, created_by)
      values
        (v_name, p_kind, v_keywords, v_reply, coalesce(p_is_active, true),
         coalesce(p_sort_order, 100), v_admin)
      returning * into v_row;
    else
      update public.support_auto_replies
      set name = v_name, kind = p_kind, keywords = v_keywords, reply = v_reply,
          is_active = coalesce(p_is_active, true),
          sort_order = coalesce(p_sort_order, 100)
      where id = p_id
      returning * into v_row;

      if not found then
        raise exception 'That auto reply no longer exists';
      end if;
    end if;
  exception
    when unique_violation then
      raise exception 'Another active % already exists. Turn it off first.',
        case p_kind when 'greeting' then 'greeting' else 'fallback' end;
  end;

  perform public.log_audit(
    v_admin, 'save_auto_reply', 'auto_reply', v_row.id,
    jsonb_build_object('name', v_row.name, 'kind', v_row.kind, 'active', v_row.is_active)
  );

  return v_row;
end;
$$;


create or replace function public.admin_delete_auto_reply(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_name text;
begin
  if not public.is_admin() then
    raise exception 'admin_delete_auto_reply: caller is not an admin';
  end if;

  delete from public.support_auto_replies where id = p_id returning name into v_name;
  if not found then
    raise exception 'That auto reply no longer exists';
  end if;

  perform public.log_audit(
    v_admin, 'delete_auto_reply', 'auto_reply', p_id,
    jsonb_build_object('name', v_name)
  );
end;
$$;


revoke all on function public.send_my_support_message(text) from public, anon;
revoke all on function public.admin_list_auto_replies() from public, anon;
revoke all on function public.admin_save_auto_reply(uuid, text, text, text[], text, boolean, integer) from public, anon;
revoke all on function public.admin_delete_auto_reply(uuid) from public, anon;

grant execute on function public.send_my_support_message(text) to authenticated;
grant execute on function public.admin_list_auto_replies() to authenticated;
grant execute on function public.admin_save_auto_reply(uuid, text, text, text[], text, boolean, integer) to authenticated;
grant execute on function public.admin_delete_auto_reply(uuid) to authenticated;

notify pgrst, 'reload schema';