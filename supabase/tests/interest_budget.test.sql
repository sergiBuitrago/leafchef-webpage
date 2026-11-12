-- Run as the migration/admin role. All test data mutations are rolled back.
begin;
do $$
declare i integer;
begin
  if has_function_privilege('anon','public.leafchef_web_consume_interest_budget()','EXECUTE')
    or has_function_privilege('authenticated','public.leafchef_web_consume_interest_budget()','EXECUTE')
  then raise exception 'Browser roles can consume budget'; end if;
  if not has_function_privilege('service_role','public.leafchef_web_consume_interest_budget()','EXECUTE')
  then raise exception 'Service role cannot consume budget'; end if;
  -- Isolate from any live counter values inside this rolled-back transaction.
  delete from leafchef_web_private.interest_budget;
  for i in 1..20 loop
    if not public.leafchef_web_consume_interest_budget() then raise exception 'Unexpected hourly rejection'; end if;
  end loop;
  if public.leafchef_web_consume_interest_budget() then raise exception 'Hourly cap failed'; end if;
  update leafchef_web_private.interest_budget set hour_start=hour_start-interval '1 hour',day_count=99;
  if not public.leafchef_web_consume_interest_budget() then raise exception 'Hour rollover failed'; end if;
  update leafchef_web_private.interest_budget set hour_start=hour_start-interval '1 hour';
  if public.leafchef_web_consume_interest_budget() then raise exception 'Daily cap failed'; end if;
  update leafchef_web_private.interest_budget set day_start=day_start-interval '1 day',hour_start=hour_start-interval '1 hour';
  if not public.leafchef_web_consume_interest_budget() then raise exception 'Day rollover failed'; end if;
end $$;
rollback;
