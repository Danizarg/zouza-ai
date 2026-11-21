-- 0005 conversations and messages: started only by a signed-in seeker about a published listing,
-- naming its real owner; only the two participants read; you send only as yourself; no edits or
-- deletes from clients; per-side read markers; messages streamed over Realtime.

alter table public.conversations add column seeker_last_read_at timestamptz;
alter table public.conversations add column owner_last_read_at timestamptz;
alter table public.conversations add constraint conversations_listing_seeker_key unique (listing_id, seeker_id);

create index if not exists conversations_seeker_idx on public.conversations (seeker_id);
create index if not exists conversations_owner_idx on public.conversations (owner_id);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);
create index if not exists messages_sender_idx on public.messages (sender_id);

drop policy if exists "Seekers start conversations" on public.conversations;
create policy "Seekers start conversations about published listings" on public.conversations
  for insert to authenticated with check (
    seeker_id = (select auth.uid())
    and seeker_id <> owner_id
    and exists (select 1 from public.listings l
                where l.id = listing_id and l.status = 'published' and l.owner_id = conversations.owner_id));

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages as themselves" on public.messages
  for insert to authenticated with check (
    sender_id = (select auth.uid())
    and sender_kind = 'user'
    and exists (select 1 from public.conversations c
                where c.id = conversation_id
                  and (c.seeker_id = (select auth.uid()) or c.owner_id = (select auth.uid()))));

revoke update, delete on public.conversations from anon, authenticated;
revoke update, delete on public.messages from anon, authenticated;

create or replace function public.messages_touch()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch
  after insert on public.messages
  for each row execute function public.messages_touch();

create or replace function public.mark_conversation_read(conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare me uuid := auth.uid();
begin
  update public.conversations c
     set seeker_last_read_at = case when c.seeker_id = me then now() else c.seeker_last_read_at end,
         owner_last_read_at  = case when c.owner_id  = me then now() else c.owner_last_read_at end
   where c.id = mark_conversation_read.conversation_id
     and (c.seeker_id = me or c.owner_id = me);
end;
$$;

revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

alter publication supabase_realtime add table public.messages;
