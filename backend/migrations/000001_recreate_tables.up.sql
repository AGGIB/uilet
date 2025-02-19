-- Удаляем существующие таблицы
DROP TABLE IF EXISTS apartment_availability CASCADE;
DROP TABLE IF EXISTS apartments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Создаем таблицу пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу квартир
CREATE TABLE apartments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    complex VARCHAR(255) NOT NULL,
    rooms INTEGER NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    address VARCHAR(255),
    area DECIMAL(10,2),
    floor INTEGER,
    amenities JSONB DEFAULT '{}'::JSONB,
    location VARCHAR(255),
    rules TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    images BYTEA[],
    image_types VARCHAR[],
    image_count INTEGER DEFAULT 0
);

-- Создаем таблицу доступности квартир
CREATE TABLE apartment_availability (
    id SERIAL PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
    date_start TIMESTAMP WITH TIME ZONE NOT NULL,
    date_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'available', 'booked', 'blocked'
    source VARCHAR(50), -- 'uilet', 'airbnb', 'booking'
    guest_name VARCHAR(255),
    guest_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_apartments_user_id ON apartments(user_id);
CREATE INDEX idx_apartment_availability_apartment_id ON apartment_availability(apartment_id);
CREATE INDEX idx_apartment_availability_dates ON apartment_availability(date_start, date_end); 