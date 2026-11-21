-- seeker_requests_owner_confirms / requester_name_from_profile / busy_ranges_show_dates_not_names
do $$ declare a uuid := tests.new_user('o@test.zouza', 'Olga'); b uuid := tests.new_user('s@test.zouza', 'Bea');
  lid uuid; rid uuid; pend uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(b);
  insert into public.viewing_requests (listing_id, requester_id, requester_name, preferred_date, end_date, guests, kind)
  values (lid, b, 'Someone Else', '2027-03-01', '2027-03-05', 2, 'stay') returning id into rid;
  insert into public.viewing_requests (listing_id, requester_id, preferred_date, end_date, kind)
  values (lid, b, '2027-04-01', '2027-04-03', 'stay') returning id into pend;
  perform tests.expect_count(format($q$select 1 from public.viewing_requests where id = %L and requester_name = 'Bea'$q$, rid), 1);
  perform tests.as_user(a);
  update public.viewing_requests set status = 'confirmed' where id = rid;
  perform tests.expect_count(format($q$select 1 from public.viewing_requests where id = %L and status = 'confirmed'$q$, rid), 1);
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listing_busy_ranges(%L) where start_date = '2027-03-01' and end_date = '2027-03-05'$q$, lid), 1);
  perform tests.expect_count(format($q$select 1 from public.listing_busy_ranges(%L)$q$, lid), 1);
  perform tests.expect_count(format($q$select json_object_keys(row_to_json(r)) from public.listing_busy_ranges(%L) r$q$, lid), 2);
end $$;

-- requester_cannot_confirm / owner_cannot_cancel_for_requester / requester_cancels / no_other_edits
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o2@test.zouza'); b uuid := tests.new_user('s2@test.zouza');
  lid uuid; rid uuid; begin
  lid := tests.new_listing(a);
  insert into public.viewing_requests (listing_id, requester_id, preferred_date) values (lid, b, '2027-05-01') returning id into rid;
  perform tests.as_user(b);
  perform tests.expect_error(format($q$update public.viewing_requests set status = 'confirmed' where id = %L$q$, rid), '42501');
  perform tests.expect_error(format($q$update public.viewing_requests set preferred_date = '2027-06-01' where id = %L$q$, rid), '42501');
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.viewing_requests set status = 'cancelled' where id = %L$q$, rid), '42501');
  perform tests.expect_error(format($q$update public.viewing_requests set preferred_date = '2027-06-01', status = 'confirmed' where id = %L$q$, rid), '42501');
  perform tests.as_user(b);
  update public.viewing_requests set status = 'cancelled' where id = rid;
  perform tests.expect_count(format($q$select 1 from public.viewing_requests where id = %L and status = 'cancelled'$q$, rid), 1);
  perform tests.expect_error(format($q$delete from public.viewing_requests where id = %L$q$, rid), '42501');
end $$;

-- outsider_sees_no_requests / cannot_request_own_or_draft_listing
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o3@test.zouza'); b uuid := tests.new_user('s3@test.zouza');
  x uuid := tests.new_user('x3@test.zouza'); lid uuid; dr uuid; begin
  lid := tests.new_listing(a); dr := tests.new_listing(a, 'draft');
  insert into public.viewing_requests (listing_id, requester_id, preferred_date) values (lid, b, '2027-05-01');
  perform tests.as_user(x);
  perform tests.expect_count(format($q$select 1 from public.viewing_requests where listing_id = %L$q$, lid), 0);
  perform tests.expect_error(format($q$insert into public.viewing_requests (listing_id, requester_id, preferred_date) values (%L, %L, '2027-05-01')$q$, lid, b), '42501');
  perform tests.expect_error(format($q$insert into public.viewing_requests (listing_id, requester_id, preferred_date) values (%L, %L, '2027-05-01')$q$, dr, x), '42501');
  perform tests.as_user(a);
  perform tests.expect_error(format($q$insert into public.viewing_requests (listing_id, requester_id, preferred_date) values (%L, %L, '2027-05-01')$q$, lid, a), '42501');
end $$;

-- review_updates_rating / second_review_rejected / cannot_review_own_listing / author_name_from_profile
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o4@test.zouza'); b uuid := tests.new_user('s4@test.zouza', 'Bea');
  c uuid := tests.new_user('c4@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(b);
  insert into public.reviews (listing_id, author_id, author_name, rating, comment) values (lid, b, 'Fake Name', 4, 'Nice');
  perform tests.expect_error(format($q$insert into public.reviews (listing_id, author_id, rating) values (%L, %L, 5)$q$, lid, b), '23505');
  perform tests.as_user(c);
  insert into public.reviews (listing_id, author_id, rating) values (lid, c, 5);
  perform tests.as_user(a);
  perform tests.expect_error(format($q$insert into public.reviews (listing_id, author_id, rating) values (%L, %L, 5)$q$, lid, a), '42501');
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and rating = 4.50 and review_count = 2$q$, lid), 1);
  perform tests.expect_count(format($q$select 1 from public.reviews where listing_id = %L and author_name = 'Bea'$q$, lid), 1);
end $$;

-- saved_is_private
select tests.as_admin();
do $$ declare a uuid := tests.new_user('o5@test.zouza'); b uuid := tests.new_user('s5@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(b);
  insert into public.saved_listings (user_id, listing_id) values (b, lid);
  perform tests.expect_count(format($q$select 1 from public.saved_listings where listing_id = %L$q$, lid), 1);
  perform tests.as_user(a);
  perform tests.expect_count(format($q$select 1 from public.saved_listings where listing_id = %L$q$, lid), 0);
  perform tests.expect_error(format($q$insert into public.saved_listings (user_id, listing_id) values (%L, %L)$q$, b, lid), '42501');
end $$;
