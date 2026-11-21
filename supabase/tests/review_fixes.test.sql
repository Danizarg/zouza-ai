insert into private.banned_terms (term) values ('testbadword');

-- anon_cannot_learn_blocks (review Important 1)
do $$ declare a uuid := tests.new_user('r1@test.zouza'); b uuid := tests.new_user('r2@test.zouza'); begin
  insert into public.blocks (blocker_id, blocked_id) values (a, b);
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 where public.is_blocked_between(%L, %L)$q$, a, b), 0);
end $$;

-- pending_review_cannot_escape_via_draft / removed_listing_cannot_be_deleted (review Important 2)
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r3@test.zouza'); pend uuid; rem uuid; begin
  pend := tests.new_listing(a, 'pending_review');
  rem := tests.new_listing(a, 'removed');
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.listings set status = 'draft' where id = %L$q$, pend), '42501');
  perform tests.expect_error(format($q$update public.listings set status = 'archived' where id = %L$q$, pend), '42501');
  update public.listings set title = 'Edited while in review' where id = pend;
  delete from public.listings where id = rem;
  perform tests.as_admin();
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L$q$, rem), 1);
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and status = 'pending_review' and title = 'Edited while in review'$q$, pend), 1);
end $$;

-- photos_cannot_move_between_listings (review Important 3)
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r4@test.zouza'); la uuid; lb uuid; begin
  la := tests.new_listing(a); lb := tests.new_listing(a);
  insert into public.listing_images (listing_id, url, sort_order) select la, 'https://x/a' || i, i from generate_series(0, 14) i;
  insert into public.listing_images (listing_id, url, sort_order) values (lb, 'https://x/b0', 0);
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.listing_images set listing_id = %L where listing_id = %L$q$, la, lb), '42501');
  update public.listing_images set sort_order = 5 where listing_id = lb;
end $$;

-- seekers_cannot_set_zouza_only_conversation_columns / messages_cannot_forge_time (review Important 4)
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r5@test.zouza'); b uuid := tests.new_user('r6@test.zouza'); lid uuid; cid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id, prequalified) values (%L, %L, %L, true)$q$, lid, b, a), '42501');
  perform tests.expect_error(format($q$insert into public.conversations (listing_id, seeker_id, owner_id, owner_last_read_at) values (%L, %L, %L, '2099-01-01')$q$, lid, b, a), '42501');
  insert into public.conversations (listing_id, seeker_id, owner_id) values (lid, b, a) returning id into cid;
  perform tests.expect_error(format($q$insert into public.messages (conversation_id, sender_id, body, created_at) values (%L, %L, 'hi', '2099-06-01')$q$, cid, b), '42501');
  insert into public.messages (conversation_id, sender_id, body) values (cid, b, 'hi');
end $$;

-- filter_covers_all_public_user_text (review Important 5)
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r7@test.zouza'); b uuid := tests.new_user('r8@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(a);
  perform tests.expect_error(format($q$insert into public.listing_features (listing_id, label) values (%L, 'testbadword balcony')$q$, lid), '23514');
  perform tests.expect_error(format($q$update public.listings set address_area = 'testbadword street' where id = %L$q$, lid), '23514');
  perform tests.expect_error(format($q$update public.listings set city = 'testbadword' where id = %L$q$, lid), '23514');
  perform tests.expect_error(format($q$update public.listings set minimum_stay = 'testbadword' where id = %L$q$, lid), '23514');
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.viewing_requests (listing_id, requester_id, preferred_date, note) values (%L, %L, '2027-01-01', 'testbadword')$q$, lid, b), '23514');
end $$;

-- photo_bucket_not_listable_by_others (promoted Minor 2)
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r9@test.zouza'); x uuid := tests.new_user('r10@test.zouza'); begin
  insert into storage.objects (bucket_id, name, owner_id) values ('listing-images', a::text || '/draft/0.jpg', a::text);
  perform tests.as_anon();
  perform tests.expect_count($q$select 1 from storage.objects where bucket_id = 'listing-images'$q$, 0);
  perform tests.as_user(x);
  perform tests.expect_count($q$select 1 from storage.objects where bucket_id = 'listing-images'$q$, 0);
  perform tests.as_user(a);
  perform tests.expect_count($q$select 1 from storage.objects where bucket_id = 'listing-images'$q$, 1);
end $$;

-- review_still_works_when_listing_text_matches_a_new_term (promoted Minor 5)
select tests.as_admin();
do $$ declare a uuid := tests.new_user('r11@test.zouza'); b uuid := tests.new_user('r12@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a, 'published', 'Old flat newbadterm');
  insert into private.banned_terms (term) values ('newbadterm');
  perform tests.as_user(b);
  insert into public.reviews (listing_id, author_id, rating) values (lid, b, 5);
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and review_count = 1$q$, lid), 1);
end $$;
