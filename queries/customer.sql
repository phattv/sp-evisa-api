create table if not exists customer (
  id int not null,
  name varchar(50),
  email varchar(50),
  country_id int references country(id),
  passport char(39),
  birthday timestamp,
  primary key (id)
);
