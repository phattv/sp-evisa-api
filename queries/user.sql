CREATE TYPE valid_genders AS ENUM ('male', 'female');

create table if not exists user_evisa (
  id serial not null,
  email varchar(100) NOT NULL unique,
  password text NOT NULL,
  name varchar(50),
  gender valid_genders,
  phone varchar(50),
  country_id int references country(id),
  passport char(39),
  passport_expiry char(30),
  birthday date,
  is_admin boolean default(false),
  created_at timestamp,
  primary key (id)
);
