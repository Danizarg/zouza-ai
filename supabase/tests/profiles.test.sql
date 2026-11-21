-- signup_creates_profile
do $$ declare u uuid := tests.new_user('a@test.zouza', 'Ana'); begin
  perform tests.expect_count(format($q$select 1 from public.profiles where id = %L and full_name = 'Ana'
    and terms_version = '2026-11-21' and terms_accepted_at is not null$q$, u), 1);
end $$;

-- signup_without_name_gets_default
do $$ declare u uuid := gen_random_uuid(); begin
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values (u, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'n@test.zouza', '{}', now(), now());
  perform tests.expect_count(format($q$select 1 from public.profiles where id = %L and full_name = 'Zouza user'
    and terms_accepted_at is null$q$, u), 1);
end $$;

-- profiles_have_no_email_column
select tests.expect_count($$select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'profiles' and column_name = 'email'$$, 0);

-- anon_reads_profiles
do $$ declare u uuid := tests.new_user('p@test.zouza', 'Pia'); begin
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.profiles where id = %L and full_name = 'Pia'$q$, u), 1);
end $$;

-- user_cannot_verify_self / user_edits_only_own_name / user_cannot_insert_profile
select tests.as_admin();
do $$ declare a uuid := tests.new_user('a2@test.zouza'); b uuid := tests.new_user('b2@test.zouza'); begin
  perform tests.as_user(a);
  perform tests.expect_error(format($q$update public.profiles set verified = true where id = %L$q$, a), '42501');
  perform tests.expect_error(format($q$insert into public.profiles (id) values (%L)$q$, gen_random_uuid()), '42501');
  update public.profiles set full_name = 'Ana B' where id = a;
  update public.profiles set full_name = 'Hacked' where id = b;
  perform tests.as_anon();
  perform tests.expect_count(format($q$select 1 from public.profiles where id = %L and full_name = 'Ana B'$q$, a), 1);
  perform tests.expect_count(format($q$select 1 from public.profiles where id = %L and full_name = 'Hacked'$q$, b), 0);
end $$;
