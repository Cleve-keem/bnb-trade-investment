-- One conversation per user
create table if not exists public.support_conversations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references public.users(id) on delete cascade,
  status               text not null default 'open' check (status in ('open', 'closed')),
  last_message_at      timestamptz not null default timezone('utc', now()),
  last_message_preview text,
  created_at           timestamptz not null default timezone('utc', now()),
  updated_at           timestamptz not null default timezone('utc', now())
);

create table if not exists public.support_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade, -- the customer
  sender_id       uuid references public.users(id) on delete set null,
  sender_role     text not null check (sender_role in ('user', 'admin')),
  body            text not null check (length(trim(body)) between 1 and 2000),
  read_at         timestamptz,
  created_at      timestamptz not null default timezone('utc', now())
);

create index if not exists support_messages_user_idx
  on public.support_messages(user_id, created_at desc);
create index if not exists support_messages_conversation_idx
  on public.support_messages(conversation_id, created_at);
create index if not exists support_conversations_last_idx
  on public.support_conversations(last_message_at desc);

drop trigger if exists support_conversations_set_updated_at on public.support_conversations;
create trigger support_conversations_set_updated_at
before update on public.support_conversations
for each row execute function public.set_updated_at();

-- Security: read-only from the browser
alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

revoke insert, update, delete on public.support_conversations from anon, authenticated;
revoke insert, update, delete on public.support_messages from anon, authenticated;
revoke select on public.support_conversations from anon;
revoke select on public.support_messages from anon;

drop policy if exists "support_conversations_read" on public.support_conversations;
create policy "support_conversations_read"
on public.support_conversations for select to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "support_messages_read" on public.support_messages;
create policy "support_messages_read"
on public.support_messages for select to authenticated
using (user_id = auth.uid() or public.is_admin());

-- Live updates
alter publication supabase_realtime add table public.support_messages;