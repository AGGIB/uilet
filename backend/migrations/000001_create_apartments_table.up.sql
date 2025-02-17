DO $$ 
BEGIN
    -- Создаем таблицу, если она не существует
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'apartments') THEN
        CREATE TABLE apartments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            complex VARCHAR(255) NOT NULL,
            rooms INTEGER NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            address VARCHAR(255),
            area NUMERIC(10,2),
            floor INTEGER,
            images TEXT[] DEFAULT '{}',
            amenities JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Создаем индекс, если он не существует
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_apartments_user_id') THEN
        CREATE INDEX idx_apartments_user_id ON apartments(user_id);
    END IF;
END $$; 