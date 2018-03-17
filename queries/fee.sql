create table if not exists fee (
  id serial not null,
  country_iso char(2) references country(iso) not null,
  type varchar(10) not null,
  one_month_single int default(0),
  one_month_multiple int default(0),
  three_month_single int default(0),
  three_month_multiple int default(0),
  six_month_multiple int default(0),
  one_year_multiple int default(0),
  primary key (id),
  unique(country_iso, type)
);
