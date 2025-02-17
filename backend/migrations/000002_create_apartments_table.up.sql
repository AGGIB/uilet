CREATE TABLE IF NOT EXISTS apartments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    complex VARCHAR(255) NOT NULL,
    rooms INTEGER NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    address VARCHAR(255),
    area NUMERIC(10,2),
    floor INTEGER,
    images TEXT[],
    amenities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartments_user_id ON apartments(user_id); 