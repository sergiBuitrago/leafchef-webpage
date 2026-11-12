create schema leafchef_web_private;
revoke all on schema leafchef_web_private from public, anon, authenticated;
create table leafchef_web_private.interest_budget (
  id boolean primary key default true check (id),
  hour_start timestamptz not null,
  day_start timestamptz not null,
  hour_count integer not null check (hour_count between 0 and 20),
  day_count integer not null check (day_count between 0 and 100)
);
alter table leafchef_web_private.interest_budget enable row level security;
revoke all on leafchef_web_private.interest_budget from public, anon, authenticated;
create function public.leafchef_web_consume_interest_budget()
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  budget leafchef_web_private.interest_budget%rowtype;
  current_time_utc timestamptz;
  current_hour timestamptz;
  current_day timestamptz;
begin
  insert into leafchef_web_private.interest_budget (id,hour_start,day_start,hour_count,day_count)
  values (true,date_trunc('hour',clock_timestamp(),'UTC'),date_trunc('day',clock_timestamp(),'UTC'),0,0)
  on conflict (id) do nothing;
  select * into budget from leafchef_web_private.interest_budget where id = true for update;
  current_time_utc := clock_timestamp();
  current_hour := date_trunc('hour',current_time_utc,'UTC');
  current_day := date_trunc('day',current_time_utc,'UTC');
  if budget.hour_start <> current_hour then budget.hour_count := 0; end if;
  if budget.day_start <> current_day then budget.day_count := 0; end if;
  if budget.hour_count >= 20 or budget.day_count >= 100 then return false; end if;
  update leafchef_web_private.interest_budget set
    hour_start=current_hour, day_start=current_day,
    hour_count=budget.hour_count+1, day_count=budget.day_count+1
  where id=true;
  return true;
end;
$$;
revoke all on function public.leafchef_web_consume_interest_budget() from public, anon, authenticated;
grant execute on function public.leafchef_web_consume_interest_budget() to service_role;
comment on function public.leafchef_web_consume_interest_budget() is
'Shared UTC hourly/daily attempt caps for LeafChef website. Service role only; stores no visitor identifiers.';
