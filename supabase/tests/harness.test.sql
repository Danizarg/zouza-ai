-- harness_switches_roles
select tests.as_anon();
select tests.expect_count($$select 1 where current_user = 'anon'$$, 1);
select tests.as_admin();
do $$ declare u uuid := tests.new_user('a@test.zouza'); begin
  perform tests.as_user(u);
  perform tests.expect_count(format($q$select 1 where auth.uid() = %L and current_user = 'authenticated'$q$, u), 1);
end $$;

-- harness_expect_error_catches
select tests.as_admin();
select tests.expect_error($$select 1/0$$, '22012');

-- harness_expect_error_fails_when_no_error
do $$ begin
  perform tests.expect_error($q$select 1$q$, '22012');
  raise exception 'expect_error should have raised';
exception when others then
  if sqlerrm = 'expect_error should have raised' then raise; end if;
end $$;
