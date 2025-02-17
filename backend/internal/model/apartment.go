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
	Images         []string        `json:"images" db:"images"`
	Amenities      map[string]bool `json:"amenities" db:"amenities"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at" db:"updated_at"`
	AvailableDates []time.Time     `json:"available_dates" db:"available_dates"`
	Location       string          `json:"location" db:"location"`
	Features       []string        `json:"features" db:"features"`
	Rules          string          `json:"rules" db:"rules"`
}

type CreateApartmentInput struct {
	Complex     string          `json:"complex" binding:"required"`
	Rooms       int             `json:"rooms" binding:"required,min=1"`
	Price       int             `json:"price" binding:"required,min=0"`
	Description string          `json:"description"`
	Address     string          `json:"address"`
	Area        float64         `json:"area"`
	Floor       int             `json:"floor"`
	Images      []string        `json:"images"`
	Amenities   map[string]bool `json:"amenities"`
}

type UpdateApartmentInput struct {
	Complex        string          `json:"complex"`
	Rooms          int             `json:"rooms"`
	Price          int             `json:"price"`
	Description    string          `json:"description"`
	Address        string          `json:"address"`
	Area           float64         `json:"area"`
	Floor          int             `json:"floor"`
	Amenities      map[string]bool `json:"amenities"`
	AvailableDates []time.Time     `json:"available_dates"`
	Location       string          `json:"location"`
	Features       []string        `json:"features"`
	Rules          string          `json:"rules"`
}
