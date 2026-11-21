-- trigger_functions_not_callable_by_clients
select tests.as_anon();
select tests.expect_error($$select public.handle_new_user()$$, '42501');
select tests.as_admin();
do $$ declare a uuid := tests.new_user('h@test.zouza'); begin
  perform tests.as_user(a);
  perform tests.expect_error($q$select public.messages_touch()$q$, '42501');
  perform tests.expect_error($q$select public.reviews_rollup()$q$, '42501');
  perform tests.expect_error($q$select public.filter_listing_text()$q$, '42501');
  perform tests.expect_error($q$select public.filter_message_text()$q$, '42501');
  perform tests.expect_error($q$select public.filter_review_text()$q$, '42501');
  perform tests.expect_error($q$select public.filter_profile_name()$q$, '42501');
end $$;

-- block_status_not_visible_to_strangers
select tests.as_admin();
do $$ declare a uuid := tests.new_user('h1@test.zouza'); b uuid := tests.new_user('h2@test.zouza');
  x uuid := tests.new_user('h3@test.zouza'); begin
  insert into public.blocks (blocker_id, blocked_id) values (a, b);
  perform tests.as_user(x);
  perform tests.expect_count(format($q$select 1 where public.is_blocked_between(%L, %L)$q$, a, b), 0);
  perform tests.as_user(b);
  perform tests.expect_count(format($q$select 1 where public.is_blocked_between(%L, %L)$q$, a, b), 1);
end $$;

-- foreign_keys_indexed
select tests.as_admin();
select tests.expect_count($$select 1 from pg_indexes where schemaname = 'public' and indexname in
  ('saved_listings_listing_idx', 'ai_generated_content_listing_idx', 'verification_records_listing_idx')$$, 3);
