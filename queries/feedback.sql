create table if not exists feedback (
  id serial not null,
  name varchar(100),
  email varchar(100) NOT NULL,
  phone varchar(20),
  subject varchar(200),
  message text NOT NULL,
  created_at timestamp NOT NULL,
);
