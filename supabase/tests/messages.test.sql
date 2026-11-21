-- seeker_starts_and_both_read / thread_bumps_last_message_at / clients_cannot_edit_messages
do $$ declare a uuid := tests.new_user('owner@test.zouza'); b uuid := tests.new_user('seeker@test.zouza');
  lid uuid; cid uuid; before timestamptz; begin
  lid := tests.new_listing(a);
  perform tests.as_user(b);
  insert into public.conversations (listing_id, seeker_id, owner_id) values (lid, b, a) returning id into cid;
  perform tests.as_admin();
  update public.conversations set last_message_at = '2000-01-01' where id = cid;
  before := '2000-01-02';
  perform tests.as_user(b);
  insert into public.messages (conversation_id, sender_id, body) values (cid, b, 'Is it still available?');
  perform tests.as_user(a);
  perform tests.expect_count(format($q$select 1 from public.messages where conversation_id = %L$q$, cid), 1);
  insert into public.messages (conversation_id, sender_id, body) values (cid, a, 'Yes!');
  perform tests.expect_count(format($q$select 1 from public.conversations where id = %L and last_message_at > %L$q$, cid, before), 1);
  perform tests.expect_error(format($q$update public.messages set body = 'edited' where conversation_id = %L$q$, cid), '42501');
  perform tests.expect_error(format($q$delete from public.messages where conversation_id = %L$q$, cid), '42501');
  perform tests.as_user(b);
  perform tests.expect_count(format($q$select 1 from public.messages where conversation_id = %L$q$, cid), 2);
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id) values (%L, %L, %L)$q$, lid, b, a), '23505');
end $$;

-- cannot_start_on_draft / cannot_start_on_own_listing / cannot_name_wrong_owner
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o2@test.zouza'); b uuid := tests.new_user('s2@test.zouza');
  c uuid := tests.new_user('c2@test.zouza'); pub uuid; dr uuid; begin
  pub := tests.new_listing(a); dr := tests.new_listing(a, 'draft');
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id) values (%L, %L, %L)$q$, dr, b, a), '42501');
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id) values (%L, %L, %L)$q$, pub, b, c), '42501');
  perform tests.as_user(a);
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id) values (%L, %L, %L)$q$, pub, a, a), '42501');
end $$;

-- cannot_send_as_other / cannot_send_as_ai / outsider_reads_nothing
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o3@test.zouza'); b uuid := tests.new_user('s3@test.zouza');
  x uuid := tests.new_user('x3@test.zouza'); lid uuid; cid uuid; begin
  lid := tests.new_listing(a);
  insert into public.conversations (listing_id, seeker_id, owner_id) values (lid, b, a) returning id into cid;
  insert into public.messages (conversation_id, sender_id, body) values (cid, b, 'hello');
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, body) values (%L, %L, 'I am the owner')$q$, cid, a), '42501');
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, sender_kind, body) values (%L, %L, 'zouza_ai', 'fake AI')$q$, cid, b), '42501');
  perform tests.as_user(x);
  perform tests.expect_count(format($q$select 1 from public.messages where conversation_id = %L$q$, cid), 0);
  perform tests.expect_count(format($q$select 1 from public.conversations where id = %L$q$, cid), 0);
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, body) values (%L, %L, 'spam')$q$, cid, x), '42501');
end $$;

-- mark_read_sets_only_my_side
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o4@test.zouza'); b uuid := tests.new_user('s4@test.zouza');
  x uuid := tests.new_user('x4@test.zouza'); lid uuid; cid uuid; begin
  lid := tests.new_listing(a);
  insert into public.conversations (listing_id, seeker_id, owner_id) values (lid, b, a) returning id into cid;
  perform tests.as_user(x);
  perform public.mark_conversation_read(cid);
  perform tests.as_user(b);
  perform public.mark_conversation_read(cid);
  perform tests.expect_count(format($q$select 1 from public.conversations where id = %L
    and seeker_last_read_at is not null and owner_last_read_at is null$q$, cid), 1);
  perform tests.expect_error(format($q$update public.conversations set owner_last_read_at = now() where id = %L$q$, cid), '42501');
end $$;

-- messages_in_realtime_publication
select tests.as_admin();
select tests.expect_count($$select 1 from pg_publication_tables
  where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'$$, 1);
