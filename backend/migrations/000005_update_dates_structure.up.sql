ALTER TABLE apartments 
DROP COLUMN IF EXISTS available_dates;

CREATE TYPE booking_status AS ENUM ('available', 'booked', 'blocked');

CREATE TABLE IF NOT EXISTS apartment_availability (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
    date_start TIMESTAMP WITH TIME ZONE NOT NULL,
    date_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status booking_status NOT NULL,
    source VARCHAR(50), -- 'airbnb', 'booking', 'direct' и т.д.
    booking_id VARCHAR(100), -- внешний ID бронирования
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartment_availability_apartment_id ON apartment_availability(apartment_id);
CREATE INDEX idx_apartment_availability_dates ON apartment_availability(date_start, date_end); 