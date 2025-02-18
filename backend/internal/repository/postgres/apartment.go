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
            address, area, floor, amenities, available_dates,
            location, rules, created_at, updated_at,
            images, image_types, image_count
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
            $11, $12, $13, $14, $15::bytea[], $16::varchar[], $17
        )
        RETURNING id
    `

	amenitiesJSON, err := json.Marshal(apartment.Amenities)
	if err != nil {
		return fmt.Errorf("error marshaling amenities: %v", err)
	}

	availableDatesJSON, err := json.Marshal(apartment.AvailableDates)
	if err != nil {
		return fmt.Errorf("error marshaling available dates: %v", err)
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
		availableDatesJSON,
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
        SELECT id, user_id, complex, rooms, price, description,
               address, area, floor, amenities, created_at, updated_at,
               available_dates, location, rules,
               images, image_types,
               COALESCE(array_length(images, 1), 0) as image_count
        FROM apartments
        WHERE user_id = $1
        ORDER BY created_at DESC
    `

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying apartments: %v", err)
	}
	defer rows.Close()

	var apartments []model.Apartment
	for rows.Next() {
		var apt model.Apartment
		var amenitiesJSON, availableDatesJSON []byte

		err := rows.Scan(
			&apt.ID,
			&apt.UserID,
			&apt.Complex,
			&apt.Rooms,
			&apt.Price,
			&apt.Description,
			&apt.Address,
			&apt.Area,
			&apt.Floor,
			&amenitiesJSON,
			&apt.CreatedAt,
			&apt.UpdatedAt,
			&availableDatesJSON,
			&apt.Location,
			&apt.Rules,
			pq.Array(&apt.Images),
			pq.Array(&apt.ImageTypes),
			&apt.ImageCount,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning apartment: %v", err)
		}

		if err := json.Unmarshal(amenitiesJSON, &apt.Amenities); err != nil {
			return nil, fmt.Errorf("error unmarshaling amenities: %v", err)
		}

		if err := json.Unmarshal(availableDatesJSON, &apt.AvailableDates); err != nil {
			return nil, fmt.Errorf("error unmarshaling available dates: %v", err)
		}

		apartments = append(apartments, apt)
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
	var amenitiesJSON, availableDatesJSON []byte

	query := `
        SELECT id, user_id, complex, rooms, price, description,
               address, area, floor, amenities, created_at, updated_at,
               available_dates, location, rules,
               COALESCE(array_length(images, 1), 0) as image_count,
               images, image_types
        FROM apartments
        WHERE id = $1 AND user_id = $2
    `

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
		&apartment.CreatedAt,
		&apartment.UpdatedAt,
		&availableDatesJSON,
		&apartment.Location,
		&apartment.Rules,
		&apartment.ImageCount,
		pq.Array(&apartment.Images),
		pq.Array(&apartment.ImageTypes),
	)

	if err != nil {
		return nil, fmt.Errorf("error getting apartment: %v", err)
	}

	err = json.Unmarshal(amenitiesJSON, &apartment.Amenities)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling amenities: %v", err)
	}

	err = json.Unmarshal(availableDatesJSON, &apartment.AvailableDates)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling available dates: %v", err)
	}

	return &apartment, nil
}

func (r *ApartmentRepository) AddImages(userID uint, apartmentID string, imageData [][]byte, imageTypes []string) error {
	// Получаем текущие изображения
	query := `
        SELECT images, image_types, image_count
        FROM apartments
        WHERE id = $1 AND user_id = $2
    `

	var currentImages [][]byte
	var currentTypes []string
	var currentCount int

	err := r.db.QueryRow(query, apartmentID, userID).Scan(
		pq.Array(&currentImages),
		pq.Array(&currentTypes),
		&currentCount,
	)
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("error getting current images: %v", err)
	}

	// Добавляем новые изображения к существующим
	allImages := append(currentImages, imageData...)
	allTypes := append(currentTypes, imageTypes...)
	newCount := len(allImages)

	fmt.Printf("Current images: %d, Adding: %d, New total: %d\n", currentCount, len(imageData), newCount)

	// Обновляем запись с явным указанием типов и нового количества
	updateQuery := `
        UPDATE apartments
        SET images = $1::bytea[],
            image_types = $2::varchar[],
            image_count = $3
        WHERE id = $4 AND user_id = $5
    `

	result, err := r.db.Exec(
		updateQuery,
		pq.Array(allImages),
		pq.Array(allTypes),
		newCount,
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

	fmt.Printf("Successfully updated images. New count: %d\n", newCount)
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
