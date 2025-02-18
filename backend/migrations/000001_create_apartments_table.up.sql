DROP TABLE IF EXISTS apartments;

CREATE TABLE apartments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    complex VARCHAR(255) NOT NULL,
    rooms INTEGER NOT NULL,
    price INTEGER NOT NULL,
    description TEXT,
    address VARCHAR(255),
    area DECIMAL(10,2),
    floor INTEGER,
    amenities JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    available_dates JSONB DEFAULT '{"start": "", "end": ""}',
    location VARCHAR(255),
    rules TEXT,
    images BYTEA[] DEFAULT ARRAY[]::BYTEA[],
    image_types VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR[],
    image_count INTEGER DEFAULT 0
);

-- Создаем индекс для ускорения поиска по user_id
CREATE INDEX idx_apartments_user_id ON apartments(user_id);

-- Добавляем комментарии к таблице и колонкам для документации
COMMENT ON TABLE apartments IS 'Таблица для хранения объявлений об аренде квартир';
COMMENT ON COLUMN apartments.id IS 'Уникальный идентификатор объявления';
COMMENT ON COLUMN apartments.user_id IS 'ID пользователя, создавшего объявление';
COMMENT ON COLUMN apartments.complex IS 'Название жилого комплекса';
COMMENT ON COLUMN apartments.rooms IS 'Количество комнат';
COMMENT ON COLUMN apartments.price IS 'Цена аренды';
COMMENT ON COLUMN apartments.description IS 'Описание квартиры';
COMMENT ON COLUMN apartments.address IS 'Адрес квартиры';
COMMENT ON COLUMN apartments.area IS 'Площадь квартиры в квадратных метрах';
COMMENT ON COLUMN apartments.floor IS 'Этаж';
COMMENT ON COLUMN apartments.amenities IS 'Удобства в формате JSON';
COMMENT ON COLUMN apartments.created_at IS 'Дата и время создания объявления';
COMMENT ON COLUMN apartments.updated_at IS 'Дата и время последнего обновления';
COMMENT ON COLUMN apartments.available_dates IS 'Даты доступности в формате JSON';
COMMENT ON COLUMN apartments.location IS 'Местоположение';
COMMENT ON COLUMN apartments.rules IS 'Правила проживания';
COMMENT ON COLUMN apartments.images IS 'Массив изображений в бинарном формате';
COMMENT ON COLUMN apartments.image_types IS 'Массив MIME-типов изображений';
COMMENT ON COLUMN apartments.image_count IS 'Количество изображений';

-- Создаем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apartments_updated_at
    BEFORE UPDATE ON apartments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 