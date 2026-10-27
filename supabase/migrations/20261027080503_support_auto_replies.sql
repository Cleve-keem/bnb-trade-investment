create table if not exists public.support_auto_replies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 1 and 80),
  kind        text not null check (kind in ('greeting', 'faq', 'fallback')),
  keywords    text[] not null default '{}',
  reply       text not null check (length(trim(reply)) between 1 and 1000),
  is_active   boolean not null default true,
  sort_order  integer not null default 100,
  created_by  uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now()),
  constraint support_auto_replies_faq_has_keywords
    check (kind <> 'faq' or cardinality(keywords) > 0)
);

-- Only one active greeting and one active fallback at a time
create unique index if not exists support_auto_replies_one_active_kind
  on public.support_auto_replies(kind)
  where is_active and kind in ('greeting', 'fallback');

drop trigger if exists support_auto_replies_set_updated_at on public.support_auto_replies;
create trigger support_auto_replies_set_updated_at
before update on public.support_auto_replies
for each row execute function public.set_updated_at();

alter table public.support_auto_replies enable row level security;
revoke all on public.support_auto_replies from anon, authenticated;

-- Starter content (only if the table is empty)
insert into public.support_auto_replies (name, kind, keywords, reply, is_active, sort_order)
select * from (values
  (
    'Welcome greeting', 'greeting', '{}'::text[],
    'Hi, welcome to BNB Support. Thanks for reaching out. A member of our team will reply here as soon as possible.',
    true, 10
  ),
  (
    'We got your message', 'fallback', '{}'::text[],
    'Thanks, we''ve received your message and our team will reply here shortly. For your safety, never share your password or one-time codes in this chat.',
    true, 10
  ),
  (
    'Password reset (sample, review before turning on)', 'faq',
    array['forgot password', 'reset password'],
    'To reset your password, open the login page and choose "Forgot password". We''ll email you a reset link. If you still need help after that, our team will follow up here.',
    false, 100
  )
) as v(name, kind, keywords, reply, is_active, sort_order)
where not exists (select 1 from public.support_auto_replies);


-- Messages: allow an automatic sender, and remember which rule sent it
alter table public.support_messages
  add column if not exists auto_reply_id uuid
  references public.support_auto_replies(id) on delete set null;

alter table public.support_messages
  drop constraint if exists support_messages_sender_role_check;

alter table public.support_messages
  add constraint support_messages_sender_role_check
  check (sender_role in ('user', 'admin', 'system'));

create index if not exists support_messages_auto_reply_idx
  on public.support_messages(conversation_id, auto_reply_id, created_at desc)
  where auto_reply_id is not null;