CREATE TYPE valid_types AS ENUM ('business', 'tourist');

create table if not exists fee (
  id serial not null,
  country_id int references country(id) not null,
  type valid_types not null,
  one_month_single int default(0),
  one_month_multiple int default(0),
  three_month_single int default(0),
  three_month_multiple int default(0),
  six_month_multiple int default(0),
  one_year_multiple int default(0),
  primary key (id),
  created_at timestamp,
  unique(country_id, type)
);
