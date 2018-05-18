CREATE TYPE valid_purposes AS ENUM ('business', 'tourist');

create table if not exists order_evisa (
  id serial not null,
  price int not null,
  status varchar(20) not null default 'unpaid',
  created_at timestamp,
  updated_at timestamp,

  country_id int references country(id),
  quantity int,
  type varchar(20),
  purpose valid_purposes,
  processing_time varchar(20),
  airport varchar(100),
  arrival_date date,
  departure_date date,

  airport_fast_track varchar(50),
  car_pick_up varchar(50),
  private_visa_letter boolean default(false),

  contact json,
  applicants json,
  flight_number varchar(50),

  primary key (id)
);
