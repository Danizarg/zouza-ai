-- A known term inserted inside the test, so assertions don't depend on the seed list.
insert into private.banned_terms (term) values ('testbadword'), ('two words');

-- filter_rejects_listing_title / filter_ignores_case_and_accents / filter_allows_substring / multi_word_terms
do $$ declare a uuid := tests.new_user('a@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.listings set title = 'A testbadword flat' where id = %L$q$, lid), '23514');
  perform tests.expect_error(format($q$update public.listings set description = 'TESTBADWORD!' where id = %L$q$, lid), '23514');
  perform tests.expect_error(format($q$update public.listings set summary = 'so testbádword' where id = %L$q$, lid), '23514');
  perform tests.expect_error(format($q$update public.listings set faq = '[{"q":"x","a":"Two  Words"}]' where id = %L$q$, lid), '23514');
  update public.listings set title = 'xtestbadwordx and twowords' where id = lid;
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and title = 'xtestbadwordx and twowords'$q$, lid), 1);
end $$;

-- filter_rejects_message_review_name / signup_with_bad_name_gets_default
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o@test.zouza'); b uuid := tests.new_user('s@test.zouza');
  c uuid := tests.new_user('c@test.zouza', 'testbadword'); lid uuid; cid uuid; begin
  perform tests.expect_count(format($q$select 1 from public.profiles where id = %L and full_name = 'Zouza user'$q$, c), 1);
  lid := tests.new_listing(a);
  insert into public.conversations (listing_id, seeker_id, owner_id) values (lid, b, a) returning id into cid;
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, body) values (%L, %L, 'you testbadword')$q$, cid, b), '23514');
  perform tests.expect_error(format($q$insert into public.reviews (listing_id, author_id, rating, comment) values (%L, %L, 1, 'testbadword')$q$, lid, b), '23514');
  perform tests.expect_error(format($q$update public.profiles set full_name = 'Testbadword' where id = %L$q$, b), '23514');
end $$;

-- report_insert_only
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r@test.zouza'); b uuid := tests.new_user('t@test.zouza'); begin
  perform tests.as_user(a);
  insert into public.reports (reporter_id, target_type, target_id, reason, details) values (a, 'user', b, 'scam', 'asked for a deposit by wire');
  perform tests.expect_count($q$select 1 from public.reports$q$, 0);
  perform tests.expect_error(format($q$insert into public.reports (reporter_id, target_type, target_id, reason) values (%L, 'user', %L, 'spam')$q$, b, a), '42501');
  perform tests.expect_error(format($q$insert into public.reports (reporter_id, target_type, target_id, reason) values (%L, 'planet', %L, 'spam')$q$, a, b), '23514');
  perform tests.as_anon();
  perform tests.expect_error(format($q$insert into public.reports (reporter_id, target_type, target_id, reason) values (null, 'user', %L, 'spam')$q$, b), '42501');
  perform tests.as_admin();
  perform tests.expect_count($q$select 1 from public.reports where reason = 'scam' and status = 'open'$q$, 1);
end $$;

-- block_hides_listings_both_ways / blocks_private / cannot_block_self
select tests.as_admin();
do $$ declare a uuid := tests.new_user('a2@test.zouza'); b uuid := tests.new_user('b2@test.zouza');
  x uuid := tests.new_user('x2@test.zouza'); la uuid; lb uuid; begin
  la := tests.new_listing(a); lb := tests.new_listing(b);
  perform tests.as_user(a);
  insert into public.blocks (blocker_id, blocked_id) values (a, b);
  perform tests.expect_error(format($q$insert into public.blocks (blocker_id, blocked_id) values (%L, %L)$q$, a, a), '23514');
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L$q$, lb), 0);
  perform tests.as_user(b);
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L$q$, la), 0);
  perform tests.expect_count($q$select 1 from public.blocks$q$, 0);
  perform tests.as_user(x);
  perform tests.expect_count(format($q$select 1 from public.listings where id in (%L, %L)$q$, la, lb), 2);
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listings where id in (%L, %L)$q$, la, lb), 2);
end $$;

-- blocked_cannot_send_in_existing_thread / blocked_cannot_start_thread / blocked_reviews_hidden
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o3@test.zouza'); b uuid := tests.new_user('s3@test.zouza');
  c uuid := tests.new_user('c3@test.zouza'); la uuid; la2 uuid; cid uuid; begin
  la := tests.new_listing(a); la2 := tests.new_listing(a);
  insert into public.conversations (listing_id, seeker_id, owner_id) values (la, b, a) returning id into cid;
  insert into public.messages (conversation_id, sender_id, body) values (cid, b, 'hi');
  insert into public.reviews (listing_id, author_id, rating) values (la, b, 1);
  insert into public.blocks (blocker_id, blocked_id) values (a, b);
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, body) values (%L, %L, 'still here')$q$, cid, b), '42501');
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id) values (%L, %L, %L)$q$, la2, b, a), '42501');
  perform tests.as_user(a);
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, body) values (%L, %L, 'reply')$q$, cid, a), '42501');
  perform tests.expect_count(format($q$select 1 from public.messages where conversation_id = %L$q$, cid), 0);
  perform tests.expect_count(format($q$select 1 from public.reviews where listing_id = %L$q$, la), 0);
  perform tests.as_user(c);
  perform tests.expect_count(format($q$select 1 from public.reviews where listing_id = %L$q$, la), 1);
end $$;

-- seeded_list_blocks_abuse_but_allows_listing_words
select tests.as_admin();
do $$ declare a uuid := tests.new_user('seed@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(a);
  update public.listings set description = 'Piso luminoso con suelo de madera maciza, sofa negro y vistas a La Concha. Classic analysis of the area.' where id = lid;
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and description like 'Piso luminoso%%'$q$, lid), 1);
  perform tests.expect_error(format($q$update public.listings set description = 'Vete a la mierda' where id = %L$q$, lid), '23514');
end $$;
