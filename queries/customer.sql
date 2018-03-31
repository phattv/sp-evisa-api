CREATE TYPE valid_genders AS ENUM ('male', 'female');

create table if not exists customer (
  id int not null,
  name varchar(50),
  gender valid_genders,
  email varchar(50),
  country_id int references country(id),
  passport char(39),
  passportExpiry char(30),
  birthday timestamp,
  primary key (id)
);
