package model

import (
	"time"
)

type Apartment struct {
	ID             uint            `json:"id" db:"id"`
	UserID         uint            `json:"user_id" db:"user_id"`
	Complex        string          `json:"complex" db:"complex"`
	Rooms          int             `json:"rooms" db:"rooms"`
	Price          int             `json:"price" db:"price"`
	Description    string          `json:"description" db:"description"`
	Address        string          `json:"address" db:"address"`
	Area           float64         `json:"area" db:"area"`
	Floor          int             `json:"floor" db:"floor"`
	Amenities      map[string]bool `json:"amenities" db:"amenities"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at" db:"updated_at"`
	AvailableDates struct {
		Start string `json:"start" db:"start_date"`
		End   string `json:"end" db:"end_date"`
	} `json:"available_dates" db:"available_dates"`
	Location   string   `json:"location" db:"location"`
	Rules      string   `json:"rules" db:"rules"`
	Images     [][]byte `json:"-" db:"images"`
	ImageTypes []string `json:"image_types" db:"image_types"`
	ImageCount int      `json:"image_count"`
}

type CreateApartmentInput struct {
	Complex        string          `json:"complex" binding:"required"`
	Rooms          int             `json:"rooms" binding:"required,min=1"`
	Price          int             `json:"price" binding:"required,min=0"`
	Description    string          `json:"description"`
	Address        string          `json:"address"`
	Area           float64         `json:"area"`
	Floor          int             `json:"floor"`
	Amenities      map[string]bool `json:"amenities"`
	AvailableDates struct {
		Start string `json:"start"`
		End   string `json:"end"`
	} `json:"available_dates"`
	Location string `json:"location"`
	Rules    string `json:"rules"`
}

type UpdateApartmentInput struct {
	Complex        string          `json:"complex"`
	Rooms          int             `json:"rooms" binding:"min=1"`
	Price          int             `json:"price" binding:"min=0"`
	Description    string          `json:"description"`
	Address        string          `json:"address"`
	Area           float64         `json:"area"`
	Floor          int             `json:"floor"`
	Amenities      map[string]bool `json:"amenities"`
	AvailableDates struct {
		Start string `json:"start"`
		End   string `json:"end"`
	} `json:"availableDates"`
	Location string   `json:"location"`
	Features []string `json:"features"`
	Rules    string   `json:"rules"`
}

type ApartmentRepository interface {
	Create(apartment *Apartment) error
	GetByUserID(userID uint) ([]Apartment, error)
	GetByID(userID uint, apartmentID string) (*Apartment, error)
	Update(userID uint, apartmentID string, input *UpdateApartmentInput) error
	Delete(userID uint, apartmentID string) error
	AddImages(userID uint, apartmentID string, imageData [][]byte, imageTypes []string) error
	GetImage(apartmentID string, index int) ([]byte, string, error)
	DeleteImage(userID uint, apartmentID string, index int) error
}
