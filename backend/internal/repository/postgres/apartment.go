package postgres

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/lib/pq"
	"github.com/yourusername/uilet/internal/model"
	"github.com/yourusername/uilet/internal/utils"
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
            images, image_types, image_count, is_active
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, 
            $10, $11, $12, $13, $14::bytea[], $15::varchar[], COALESCE($16, 0), $17
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
		apartment.IsActive,
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
            a.is_active, a.created_at, a.updated_at,
            COALESCE(array_length(a.images, 1), 0) as image_count,
            NULL::bytea[] as images, -- Не загружаем изображения в списке
            a.image_types,
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
			&apt.IsActive, &apt.CreatedAt, &apt.UpdatedAt,
			&apt.ImageCount,
			pq.Array(&apt.Images),
			pq.Array(&apt.ImageTypes),
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
	// First verify ownership
	var owner uint
	var isActive bool
	err := r.db.QueryRow("SELECT user_id, is_active FROM apartments WHERE id = $1", apartmentID).Scan(&owner, &isActive)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("apartment not found")
		}
		return fmt.Errorf("error checking apartment ownership: %v", err)
	}

	if owner != userID {
		return fmt.Errorf("unauthorized: apartment does not belong to user")
	}

	// Start transaction
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	// Get current images count
	var currentImageCount int
	err = tx.QueryRow("SELECT COALESCE(array_length(images, 1), 0) FROM apartments WHERE id = $1", apartmentID).Scan(&currentImageCount)
	if err != nil {
		return fmt.Errorf("error getting current image count: %v", err)
	}

	query := `
        UPDATE apartments 
        SET complex = $1, rooms = $2, price = $3, description = $4,
            address = $5, area = $6, floor = $7, amenities = $8,
            location = $9, rules = $10, updated_at = $11, is_active = $12,
            image_count = $13
        WHERE id = $14 AND user_id = $15
        RETURNING id
    `

	amenitiesJSON, err := json.Marshal(apartment.Amenities)
	if err != nil {
		return fmt.Errorf("error marshaling amenities: %v", err)
	}

	var id string
	err = tx.QueryRow(
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
		apartment.IsActive,
		currentImageCount,
		apartmentID,
		userID,
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("error updating apartment: %v", err)
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
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
            a.is_active, a.created_at, a.updated_at,
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
		&apartment.IsActive,
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
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	// Оптимизируем каждое изображение перед сохранением
	optimizedImages := make([][]byte, 0, len(imageData))
	optimizedTypes := make([]string, 0, len(imageData))

	for _, data := range imageData {
		optimized, err := utils.OptimizeImage(data)
		if err != nil {
			return fmt.Errorf("error optimizing image: %v", err)
		}
		optimizedImages = append(optimizedImages, optimized)
		optimizedTypes = append(optimizedTypes, "image/webp") // Всегда WebP после оптимизации
	}

	// Оптимизированный запрос для обновления изображений
	query := `
        UPDATE apartments
        SET images = CASE 
            WHEN images IS NULL THEN $1::bytea[]
            ELSE images || $1::bytea[]
        END,
        image_types = CASE 
            WHEN image_types IS NULL THEN $2::varchar[]
            ELSE image_types || $2::varchar[]
        END,
        image_count = COALESCE(array_length(images, 1), 0) + $3,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5
        RETURNING id
    `

	var id string
	err = tx.QueryRow(
		query,
		pq.Array(optimizedImages),
		pq.Array(optimizedTypes),
		len(optimizedImages),
		apartmentID,
		userID,
	).Scan(&id)

	if err != nil {
		return fmt.Errorf("error updating images: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

func (r *ApartmentRepository) GetImage(apartmentID string, index int) ([]byte, string, error) {
	// Проверяем кэш
	cacheKey := fmt.Sprintf("%s-%d", apartmentID, index)
	if data, contentType, found := utils.GetImageCache().Get(cacheKey); found {
		return data, contentType, nil
	}

	// Используем подготовленный запрос как глобальную переменную
	stmt, err := r.db.Prepare(`
		SELECT 
			images[$1],
			image_types[$1]
		FROM apartments
		WHERE id = $2
		AND array_length(images, 1) >= $1
	`)
	if err != nil {
		return nil, "", fmt.Errorf("error preparing statement: %v", err)
	}
	defer stmt.Close()

	var imageData []byte
	var imageType string

	err = stmt.QueryRow(index+1, apartmentID).Scan(&imageData, &imageType)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, "", fmt.Errorf("image not found")
		}
		return nil, "", fmt.Errorf("error getting image: %v", err)
	}

	// Сохраняем в кэш
	utils.GetImageCache().Set(cacheKey, imageData, imageType)

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
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	defer tx.Rollback()

	// Получаем текущие изображения
	query := `
		SELECT images, image_types, COALESCE(image_count, 0)
		FROM apartments
		WHERE id = $1 AND user_id = $2
		FOR UPDATE
	`

	var images [][]byte
	var imageTypes []string
	var imageCount int

	err = tx.QueryRow(query, apartmentID, userID).Scan(
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
			image_count = COALESCE(array_length($1::bytea[], 1), 0)
		WHERE id = $3 AND user_id = $4
	`

	result, err := tx.Exec(
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

	// Удаляем изображение из кэша
	cacheKey := fmt.Sprintf("%s-%d", apartmentID, index)
	utils.GetImageCache().Delete(cacheKey)

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
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
	// First verify ownership and get current status
	var owner uint
	var isActive bool
	err := r.db.QueryRow("SELECT user_id, is_active FROM apartments WHERE id = $1", apartmentID).Scan(&owner, &isActive)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("apartment not found")
		}
		return fmt.Errorf("error checking apartment ownership: %v", err)
	}

	if owner != userID {
		return fmt.Errorf("unauthorized: apartment does not belong to user")
	}

	// Toggle the status
	query := `
        UPDATE apartments 
        SET is_active = NOT is_active,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING is_active
    `

	var newStatus bool
	err = r.db.QueryRow(query, apartmentID, userID).Scan(&newStatus)
	if err != nil {
		return fmt.Errorf("error updating apartment status: %v", err)
	}

	return nil
}
