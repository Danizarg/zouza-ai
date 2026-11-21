-- owner_publishes_stay_loft: stays and lofts allowed; slug and owner name filled by the database
do $$ declare a uuid := tests.new_user('a@test.zouza', 'Ana'); lid uuid := gen_random_uuid(); begin
  perform tests.as_user(a);
  insert into public.listings (id, owner_id, mode, intent, title, city, property_type, status, faq)
  values (lid, a, 'stay', 'rent_out', 'Loft by the Sea!', 'Valencia', 'loft', 'published', '[{"q":"Pets?","a":"Yes"}]');
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L
    and slug = 'loft-by-the-sea-' || substr(replace(%L::text, '-', ''), 1, 8)
    and owner_name = 'Ana' and location_approximate$q$, lid, lid), 1);
end $$;

-- anon_reads_published_not_draft
select tests.as_admin();
do $$ declare a uuid := tests.new_user('b@test.zouza'); p uuid; d uuid; begin
  p := tests.new_listing(a, 'published'); d := tests.new_listing(a, 'draft');
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L$q$, p), 1);
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L$q$, d), 0);
end $$;

-- other_user_cannot_edit / insert_for_other_owner_rejected
select tests.as_admin();
do $$ declare a uuid := tests.new_user('c@test.zouza'); b uuid := tests.new_user('d@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  perform tests.as_user(b);
  update public.listings set title = 'Mine now' where id = lid;
  perform tests.expect_error(format($q$insert into public.listings (owner_id, mode, intent, title, city, property_type)
    values (%L, 'rent', 'rent_out', 'Fake', 'Madrid', 'house')$q$, a), '42501');
  perform tests.as_admin();
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and title = 'Mine now'$q$, lid), 0);
end $$;

-- owner_cannot_self_verify / owner_cannot_set_rating / owner_cannot_set_removed / owner_cannot_publish_pending
select tests.as_admin();
do $$ declare a uuid := tests.new_user('e@test.zouza'); lid uuid; pend uuid; begin
  lid := tests.new_listing(a);
  pend := tests.new_listing(a, 'pending_review');
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.listings set verified_property = true where id = %L$q$, lid), '42501');
  perform tests.expect_error(format($q$update public.listings set rating = 5, review_count = 99 where id = %L$q$, lid), '42501');
  perform tests.expect_error(format($q$update public.listings set status = 'removed' where id = %L$q$, lid), '42501');
  perform tests.expect_error(format($q$update public.listings set status = 'published' where id = %L$q$, pend), '42501');
  update public.listings set status = 'archived', title = 'Still mine' where id = lid;
  perform tests.expect_count(format($q$select 1 from public.listings where id = %L and status = 'archived'$q$, lid), 1);
end $$;

-- owner_cannot_unremove
select tests.as_admin();
do $$ declare a uuid := tests.new_user('f@test.zouza'); lid uuid; begin
  lid := tests.new_listing(a);
  update public.listings set status = 'removed' where id = lid;
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.listings set status = 'published' where id = %L$q$, lid), '42501');
end $$;
