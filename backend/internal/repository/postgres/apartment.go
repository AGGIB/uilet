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
	amenitiesJSON, err := json.Marshal(apartment.Amenities)
	if err != nil {
		return fmt.Errorf("error marshaling amenities: %v", err)
	}

	var imagesArray interface{}
	if len(apartment.Images) > 0 {
		imagesArray = pq.Array(apartment.Images)
	} else {
		imagesArray = pq.Array([]string{})
	}

	query := `
        INSERT INTO apartments (
            user_id, complex, rooms, price, description, 
            address, area, floor, images, amenities, 
            created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
    `

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
		imagesArray,
		amenitiesJSON,
		apartment.CreatedAt,
		apartment.UpdatedAt,
	).Scan(&apartment.ID)

	if err != nil {
		return fmt.Errorf("error creating apartment: %v", err)
	}

	return nil
}

func (r *ApartmentRepository) GetByUserID(userID uint) ([]model.Apartment, error) {
	query := `
        SELECT id, user_id, complex, rooms, price, description,
               address, area, floor, images, amenities, created_at, updated_at
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
		var amenitiesJSON []byte
		var images []string

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
			pq.Array(&images),
			&amenitiesJSON,
			&apt.CreatedAt,
			&apt.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning apartment: %v", err)
		}

		apt.Images = images

		err = json.Unmarshal(amenitiesJSON, &apt.Amenities)
		if err != nil {
			return nil, fmt.Errorf("error unmarshaling amenities: %v", err)
		}

		apartments = append(apartments, apt)
	}

	return apartments, nil
}

func (r *ApartmentRepository) Update(userID uint, apartmentID string, apartment *model.UpdateApartmentInput) error {
	amenitiesJSON, err := json.Marshal(apartment.Amenities)
	if err != nil {
		return fmt.Errorf("error marshaling amenities: %v", err)
	}

	query := `
        UPDATE apartments 
        SET complex = $1, rooms = $2, price = $3, description = $4,
            address = $5, area = $6, floor = $7, amenities = $8,
            available_dates = $9, location = $10, features = $11,
            rules = $12, updated_at = $13
        WHERE id = $14 AND user_id = $15
    `

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
		apartment.AvailableDates,
		apartment.Location,
		apartment.Features,
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
        SELECT id, user_id, complex, rooms, price, description,
               address, area, floor, images, amenities, created_at, updated_at,
               available_dates, location, features, rules
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
		&apartment.Images,
		&amenitiesJSON,
		&apartment.CreatedAt,
		&apartment.UpdatedAt,
		&apartment.AvailableDates,
		&apartment.Location,
		&apartment.Features,
		&apartment.Rules,
	)

	if err != nil {
		return nil, fmt.Errorf("error getting apartment: %v", err)
	}

	err = json.Unmarshal(amenitiesJSON, &apartment.Amenities)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling amenities: %v", err)
	}

	return &apartment, nil
}

func (r *ApartmentRepository) AddImages(userID uint, apartmentID string, imageURLs []string) error {
	query := `
        UPDATE apartments
        SET images = array_cat(images, $1)
        WHERE id = $2 AND user_id = $3
    `

	result, err := r.db.Exec(query, imageURLs, apartmentID, userID)
	if err != nil {
		return fmt.Errorf("error adding images: %v", err)
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
