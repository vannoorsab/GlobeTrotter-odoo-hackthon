

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT   NOT NULL,
  full_name       TEXT   NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  cover_image_url TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  share_slug      TEXT UNIQUE,
  budget_total    NUMERIC(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);

CREATE TABLE IF NOT EXISTS cities (
  id               SERIAL PRIMARY KEY,
  name             TEXT       NOT NULL,
  country          TEXT       NOT NULL,
  popularity_score SMALLINT   NOT NULL,
  cost_index       SMALLINT   NOT NULL,
  timezone         TEXT       NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cities_name_country ON cities(name, country);

CREATE TABLE IF NOT EXISTS trip_stops (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id     INT  NOT NULL REFERENCES cities(id),
  position    INT  NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_trip_stops_trip_position UNIQUE (trip_id, position)
);

CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON trip_stops(trip_id);

CREATE TABLE IF NOT EXISTS activities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id               INT NOT NULL REFERENCES cities(id),
  created_by_user_id    UUID REFERENCES users(id),
  name                  TEXT NOT NULL,
  category              TEXT NOT NULL,
  default_cost          NUMERIC(10,2),
  default_duration_min  INT,
  description           TEXT,
  popularity_score      SMALLINT,
  is_recommended        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_city_category ON activities(city_id, category);

CREATE TABLE IF NOT EXISTS trip_activities (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_stop_id       UUID NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
  activity_id        UUID NOT NULL REFERENCES activities(id),
  scheduled_date     DATE NOT NULL,
  start_time         TIME,
  end_time           TIME,
  custom_name        TEXT,
  custom_category    TEXT,
  cost               NUMERIC(10,2),
  duration_min       INT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trip_activities_stop_date ON trip_activities(trip_stop_id, scheduled_date);

CREATE TABLE IF NOT EXISTS expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id      UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  trip_stop_id UUID REFERENCES trip_stops(id),
  category     TEXT NOT NULL,
  description  TEXT,
  amount       NUMERIC(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_date ON expenses(trip_id, expense_date);
