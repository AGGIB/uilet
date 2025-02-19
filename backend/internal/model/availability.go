package model

import "time"

type BookingStatus string

const (
	StatusAvailable BookingStatus = "available"
	StatusBooked    BookingStatus = "booked"
	StatusBlocked   BookingStatus = "blocked"
)

type Availability struct {
	ID         uint          `json:"id"`
	DateStart  time.Time     `json:"date_start"`
	DateEnd    time.Time     `json:"date_end"`
	Status     BookingStatus `json:"status"`
	Source     string        `json:"source,omitempty"`
	BookingID  string        `json:"booking_id,omitempty"`
	GuestName  string        `json:"guest_name,omitempty"`
	GuestPhone string        `json:"guest_phone,omitempty"`
}

type AvailabilityInput struct {
	DateStart string        `json:"date_start" binding:"required"`
	DateEnd   string        `json:"date_end" binding:"required"`
	Status    BookingStatus `json:"status" binding:"required"`
}

type AvailabilityRepository interface {
	Create(apartmentID uint, availability *Availability) error
	Update(id uint, availability *Availability) error
	Delete(id uint) error
	GetByApartmentID(apartmentID uint) ([]Availability, error)
}
