create table if not exists fee (
  id int not null,
  country_id int references country(id),
  type varchar(10),
  one_month_single int,
  one_month_multiple int,
  three_month_single int,
  three_month_multiple int,
  six_month_multiple int,
  one_year_multiple int,
  primary key (id)
);
