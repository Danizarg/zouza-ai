-- owner_adds_photo_and_feature / other_user_cannot_add_photo
do $$ declare a uuid := tests.new_user('a@test.zouza'); b uuid := tests.new_user('b@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(a);
  insert into public.listing_images (listing_id, url, sort_order) values (lid, 'https://x/0.jpg', 0);
  insert into public.listing_features (listing_id, label) values (lid, 'Balcony');
  perform tests.as_user(b);
  perform tests.expect_error(format($q$insert into public.listing_images (listing_id, url) values (%L, 'https://x/evil.jpg')$q$, lid), '42501');
  perform tests.expect_error(format($q$insert into public.listing_features (listing_id, label) values (%L, 'Evil')$q$, lid), '42501');
  delete from public.listing_images where listing_id = lid;
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listing_images where listing_id = %L$q$, lid), 1);
  perform tests.expect_count(format($q$select 1 from public.listing_features where listing_id = %L$q$, lid), 1);
end $$;

-- draft_photos_hidden_from_anon
select tests.as_admin();
do $$ declare a uuid := tests.new_user('c@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a, 'draft');
  insert into public.listing_images (listing_id, url) values (lid, 'https://x/d.jpg');
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listing_images where listing_id = %L$q$, lid), 0);
  perform tests.as_user(a);
  perform tests.expect_count(format($q$select 1 from public.listing_images where listing_id = %L$q$, lid), 1);
end $$;

-- sixteenth_photo_rejected
select tests.as_admin();
do $$ declare a uuid := tests.new_user('d@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(a);
  insert into public.listing_images (listing_id, url, sort_order)
    select lid, 'https://x/' || i || '.jpg', i from generate_series(0, 14) i;
  perform tests.expect_error(format($q$insert into public.listing_images (listing_id, url, sort_order) values (%L, 'https://x/15.jpg', 15)$q$, lid), '23514');
end $$;

-- upload_outside_own_folder_rejected / upload_inside_own_folder_allowed / bucket_rules
select tests.as_admin();
select tests.expect_count($$select 1 from storage.buckets where id = 'listing-images' and public
  and file_size_limit = 5242880 and allowed_mime_types = '{image/jpeg,image/png,image/webp}'$$, 1);
do $$ declare a uuid := tests.new_user('e@test.zouza'); b uuid := tests.new_user('f@test.zouza'); begin
  perform tests.as_user(a);
  insert into storage.objects (bucket_id, name, owner_id) values ('listing-images', a::text || '/l1/0.jpg', a::text);
  perform tests.expect_error(format($q$insert into storage.objects (bucket_id, name, owner_id)
    values ('listing-images', %L, %L)$q$, b::text || '/l1/0.jpg', a::text), '42501');
  perform tests.expect_count(format($q$select 1 from storage.objects where bucket_id = 'listing-images' and name = %L$q$, a::text || '/l1/0.jpg'), 1);
  perform tests.as_anon();
  perform tests.expect_error($q$insert into storage.objects (bucket_id, name) values ('listing-images', 'anon/x.jpg')$q$, '42501');
end $$;
