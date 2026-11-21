-- Test helpers. The runner prepends this file to every *.test.sql and wraps both in a transaction
-- that is always rolled back, so nothing here (or created by a test) survives.

create schema tests;
grant usage on schema tests to anon, authenticated;

-- Create a confirmed user directly in auth.users; the signup trigger creates the profile.
create function tests.new_user(email text, full_name text default 'Test User') returns uuid
language plpgsql as $$
declare uid uuid := gen_random_uuid();
begin
  insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,
                          raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
  values (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email, now(),
          jsonb_build_object('full_name', full_name, 'terms_version', '2026-11-21'),
          '{"provider":"email","providers":["email"]}', now(), now());
  return uid;
end $$;

-- Act as a signed-in user, as a signed-out visitor, or as the database owner again.
create function tests.as_user(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated', 'is_anonymous', false)::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

create function tests.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  perform set_config('role', 'anon', true);
end $$;

create function tests.as_admin() returns void language plpgsql as $$
begin
  perform set_config('role', 'none', true);
  perform set_config('request.jwt.claims', '', true);
end $$;

-- Fail unless stmt raises the given SQLSTATE.
create function tests.expect_error(stmt text, state text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    if sqlstate = state then return; end if;
    raise exception 'expected % but got % (%) from: %', state, sqlstate, sqlerrm, stmt;
  end;
  raise exception 'expected % from: %', state, stmt;
end $$;

-- Fail unless the query returns exactly n rows.
create function tests.expect_count(query text, n int) returns void language plpgsql as $$
declare c int;
begin
  execute format('select count(*) from (%s) q', query) into c;
  if c <> n then raise exception 'expected % rows, got % from: %', n, c, query; end if;
end $$;

grant execute on all functions in schema tests to anon, authenticated;

-- Create a listing as the database owner (no client rules apply); returns its id.
create function tests.new_listing(owner uuid, status text default 'published', title text default 'Sunny flat')
returns uuid language plpgsql as $$
declare lid uuid := gen_random_uuid();
begin
  insert into public.listings (id, owner_id, mode, intent, title, city, property_type, status)
  values (lid, owner, 'rent', 'rent_out', title, 'Valencia', 'apartment', status);
  return lid;
end $$;
grant execute on function tests.new_listing(uuid, text, text) to anon, authenticated;
