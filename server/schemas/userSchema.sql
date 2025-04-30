CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(50)   UNIQUE NOT NULL,
  email           VARCHAR(255)  UNIQUE NOT NULL,
  hashed_password VARCHAR(255)  NOT NULL,
  role            VARCHAR(20)   NOT NULL DEFAULT 'user',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);