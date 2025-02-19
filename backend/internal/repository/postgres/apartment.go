package postgres

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/lib/pq"
	"github.com/yourusername/uilet/internal/model"
)

type ApartmentRepository struct {
	db *sql.DB
}

func NewApartmentRepository(db *sql.DB) *ApartmentRepository {
	return &ApartmentRepository{db: db}
}

func (r *ApartmentRepository) Create(apartment *model.Apartment) error {
	query := `
        INSERT INTO apartments (
            user_id, complex, rooms, price, description, 
            address, area, floor, amenities,
            location, rules, created_at, updated_at,
            images, image_types, image_count
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, 
            $10, $11, $12, $13, $14::bytea[], $15::varchar[], $16
        )
        RETURNING id
    `

	amenitiesJSON, err := json.Marshal(apartment.Amenities)
	if err != nil {
		return fmt.Errorf("error marshaling amenities: %v", err)
	}

	err = r.db.QueryRow(
		query,
		apartment.UserID,
		apartment.Complex,
		apartment.Rooms,
		apartment.Price,
		apartment.Description,
		apartment.Address,
		apartment.Area,
		apartment.Floor,
		amenitiesJSON,
		apartment.Location,
		apartment.Rules,
		apartment.CreatedAt,
		apartment.UpdatedAt,
		pq.Array(apartment.Images),
		pq.Array(apartment.ImageTypes),
		apartment.ImageCount,
	).Scan(&apartment.ID)

	if err != nil {
		return fmt.Errorf("error creating apartment: %v", err)
	}

	return nil
}

func (r *ApartmentRepository) GetByUserID(userID uint) ([]model.Apartment, error) {
	query := `
        SELECT 
            a.id, a.user_id, a.complex, a.rooms, a.price, 
            a.description, a.address, a.area, a.floor, 
            a.amenities::text, a.location, a.rules, 
            a.created_at, a.updated_at,
            a.images, a.image_types, a.image_count,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', av.id,
                        'date_start', av.date_start,
                        'date_end', av.date_end,
                        'status', av.status,
                        'source', av.source,
                        'guest_name', av.guest_name
                    )
                ) FILTER (WHERE av.id IS NOT NULL),
                '[]'
            ) as availabilities
        FROM apartments a
        LEFT JOIN apartment_availability av ON a.id = av.apartment_id
        WHERE a.user_id = $1
        GROUP BY a.id
        ORDER BY a.created_at DESC
    `

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying apartments: %v", err)
	}
	defer rows.Close()

	var apartments []model.Apartment
	for rows.Next() {
		var apt model.Apartment
		var amenitiesJSON []byte
		var availabilitiesJSON string
		apt.Amenities = make(map[string]bool)

		err := rows.Scan(
			&apt.ID, &apt.UserID, &apt.Complex, &apt.Rooms, &apt.Price,
			&apt.Description, &apt.Address, &apt.Area, &apt.Floor,
			&amenitiesJSON, &apt.Location, &apt.Rules,
			&apt.CreatedAt, &apt.UpdatedAt,
			pq.Array(&apt.Images), pq.Array(&apt.ImageTypes), &apt.ImageCount,
			&availabilitiesJSON,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning apartment: %v", err)
		}

		// Парсим JSON с удобствами
		if err := json.Unmarshal(amenitiesJSON, &apt.Amenities); err != nil {
			return nil, fmt.Errorf("error parsing amenities: %v", err)
		}

		// Парсим JSON с доступностью
		var availabilities []model.Availability
		if err := json.Unmarshal([]byte(availabilitiesJSON), &availabilities); err != nil {
			return nil, fmt.Errorf("error parsing availabilities: %v", err)
		}
		apt.Availabilities = availabilities

		apartments = append(apartments, apt)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %v", err)
	}

	return apartments, nil
}

func (r *ApartmentRepository) Update(userID uint, apartmentID string, apartment *model.UpdateApartmentInput) error {
	query := `
        UPDATE apartments 
        SET complex = $1, rooms = $2, price = $3, description = $4,
            address = $5, area = $6, floor = $7, amenities = $8,
            location = $9, rules = $10, updated_at = $11
        WHERE id = $12 AND user_id = $13
    `

	amenitiesJSON, err := json.Marshal(apartment.Amenities)
	if err != nil {
		return fmt.Errorf("error marshaling amenities: %v", err)
	}

	result, err := r.db.Exec(
		query,
		apartment.Complex,
		apartment.Rooms,
		apartment.Price,
		apartment.Description,
		apartment.Address,
		apartment.Area,
		apartment.Floor,
		amenitiesJSON,
		apartment.Location,
		apartment.Rules,
		time.Now(),
		apartmentID,
		userID,
	)

	if err != nil {
		return fmt.Errorf("error updating apartment: %v", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %v", err)
	}

	if rows == 0 {
		return fmt.Errorf("apartment not found or not owned by user")
	}

	return nil
}

func (r *ApartmentRepository) GetByID(userID uint, apartmentID string) (*model.Apartment, error) {
	var apartment model.Apartment
	var amenitiesJSON []byte

	query := `
        SELECT 
            a.id, a.user_id, a.complex, a.rooms, a.price, 
            a.description, a.address, a.area, a.floor, 
            a.amenities, a.location, a.rules,
            a.created_at, a.updated_at,
            COALESCE(array_length(a.images, 1), 0) as image_count,
            a.images, a.image_types,
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', av.id,
                        'date_start', av.date_start,
                        'date_end', av.date_end,
                        'status', av.status,
                        'source', av.source,
                        'guest_name', av.guest_name
                    )
                ) FILTER (WHERE av.id IS NOT NULL),
                '[]'
            ) as availabilities
        FROM apartments a
        LEFT JOIN apartment_availability av ON a.id = av.apartment_id
        WHERE a.id = $1 AND a.user_id = $2
        GROUP BY a.id
    `

	var availabilitiesJSON string
	err := r.db.QueryRow(query, apartmentID, userID).Scan(
		&apartment.ID,
		&apartment.UserID,
		&apartment.Complex,
		&apartment.Rooms,
		&apartment.Price,
		&apartment.Description,
		&apartment.Address,
		&apartment.Area,
		&apartment.Floor,
		&amenitiesJSON,
		&apartment.Location,
		&apartment.Rules,
		&apartment.CreatedAt,
		&apartment.UpdatedAt,
		&apartment.ImageCount,
		pq.Array(&apartment.Images),
		pq.Array(&apartment.ImageTypes),
		&availabilitiesJSON,
	)

	if err != nil {
		return nil, fmt.Errorf("error getting apartment: %v", err)
	}

	if err := json.Unmarshal(amenitiesJSON, &apartment.Amenities); err != nil {
		return nil, fmt.Errorf("error unmarshaling amenities: %v", err)
	}

	var availabilities []model.Availability
	if err := json.Unmarshal([]byte(availabilitiesJSON), &availabilities); err != nil {
		return nil, fmt.Errorf("error parsing availabilities: %v", err)
	}
	apartment.Availabilities = availabilities

	return &apartment, nil
}

func (r *ApartmentRepository) AddImages(userID uint, apartmentID string, imageData [][]byte, imageTypes []string) error {
	// Сначала получаем текущие изображения
	var currentImages [][]byte
	var currentTypes []string
	var currentCount int

	query := `
        SELECT images, image_types, image_count 
        FROM apartments 
        WHERE id = $1 AND user_id = $2
    `
	err := r.db.QueryRow(query, apartmentID, userID).Scan(
		pq.Array(&currentImages),
		pq.Array(&currentTypes),
		&currentCount,
	)

	// Если нет существующих изображений, используем пустые массивы
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("error getting current images: %v", err)
	}

	// Добавляем новые изображения к существующим
	allImages := append(currentImages, imageData...)
	allTypes := append(currentTypes, imageTypes...)

	// Обновляем запись в базе данных
	updateQuery := `
        UPDATE apartments
        SET images = $1::bytea[],
            image_types = $2::varchar[],
            image_count = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5
    `

	result, err := r.db.Exec(
		updateQuery,
		pq.Array(allImages),
		pq.Array(allTypes),
		len(allImages), // Используем актуальное количество изображений
		apartmentID,
		userID,
	)
	if err != nil {
		return fmt.Errorf("error updating images: %v", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %v", err)
	}

	if rows == 0 {
		return fmt.Errorf("apartment not found or not owned by user")
	}

	return nil
}

func (r *ApartmentRepository) GetImage(apartmentID string, index int) ([]byte, string, error) {
	fmt.Printf("Getting image %d for apartment %s\n", index, apartmentID) // Для отладки

	query := `
        SELECT 
            images[$1],
            image_types[$1]
        FROM apartments
        WHERE id = $2
    `

	var imageData []byte
	var imageType string

	err := r.db.QueryRow(query, index+1, apartmentID).Scan(&imageData, &imageType)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, "", fmt.Errorf("apartment not found")
		}
		return nil, "", fmt.Errorf("error getting image: %v", err)
	}

	if imageData == nil {
		return nil, "", fmt.Errorf("image not found")
	}

	fmt.Printf("Successfully retrieved image. Type: %s, Size: %d bytes\n", imageType, len(imageData)) // Для отладки
	return imageData, imageType, nil
}

func (r *ApartmentRepository) Delete(userID uint, apartmentID string) error {
	query := `DELETE FROM apartments WHERE id = $1 AND user_id = $2`

	result, err := r.db.Exec(query, apartmentID, userID)
	if err != nil {
		return fmt.Errorf("error deleting apartment: %v", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %v", err)
	}

	if rows == 0 {
		return fmt.Errorf("apartment not found or not owned by user")
	}

	return nil
}

func (r *ApartmentRepository) DeleteImage(userID uint, apartmentID string, index int) error {
	// Получаем текущие изображения
	query := `
        SELECT images, image_types, image_count
        FROM apartments
        WHERE id = $1 AND user_id = $2
    `

	var images [][]byte
	var imageTypes []string
	var imageCount int

	err := r.db.QueryRow(query, apartmentID, userID).Scan(
		pq.Array(&images),
		pq.Array(&imageTypes),
		&imageCount,
	)
	if err != nil {
		return fmt.Errorf("error getting current images: %v", err)
	}

	// Проверяем валидность индекса
	if index < 0 || index >= len(images) {
		return fmt.Errorf("invalid image index")
	}

	// Удаляем изображение и его тип из слайсов
	images = append(images[:index], images[index+1:]...)
	imageTypes = append(imageTypes[:index], imageTypes[index+1:]...)

	// Обновляем запись в базе данных
	updateQuery := `
        UPDATE apartments
        SET images = $1::bytea[],
            image_types = $2::varchar[],
            image_count = array_length($1::bytea[], 1)
        WHERE id = $3 AND user_id = $4
    `

	result, err := r.db.Exec(
		updateQuery,
		pq.Array(images),
		pq.Array(imageTypes),
		apartmentID,
		userID,
	)
	if err != nil {
		return fmt.Errorf("error updating images: %v", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %v", err)
	}

	if rows == 0 {
		return fmt.Errorf("apartment not found or not owned by user")
	}

	return nil
}

func (r *ApartmentRepository) DeleteAvailabilities(apartmentID uint) error {
	query := `DELETE FROM apartment_availability WHERE apartment_id = $1`
	_, err := r.db.Exec(query, apartmentID)
	return err
}

func (r *ApartmentRepository) CreateAvailability(apartmentID uint, availability *model.Availability) error {
	query := `
		INSERT INTO apartment_availability 
		(apartment_id, date_start, date_end, status, source, guest_name, guest_phone)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	return r.db.QueryRow(
		query,
		apartmentID,
		availability.DateStart,
		availability.DateEnd,
		availability.Status,
		availability.Source,
		availability.GuestName,
		availability.GuestPhone,
	).Scan(&availability.ID)
}

func (r *ApartmentRepository) ToggleActive(userID uint, apartmentID string) error {
	query := `
        UPDATE apartments 
        SET is_active = NOT is_active,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
    `

	result, err := r.db.Exec(query, apartmentID, userID)
	if err != nil {
		return fmt.Errorf("error updating apartment status: %v", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("error getting rows affected: %v", err)
	}

	if rows == 0 {
		return fmt.Errorf("apartment not found or not owned by user")
	}

	return nil
}
