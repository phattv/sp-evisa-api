create table if not exists application (
  id int not null,
  country_id int references country(id),
  customer_id int references customer(id),
  fee_id int references fee(id),
  data json,
  primary key (id)
);
