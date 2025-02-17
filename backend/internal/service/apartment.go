package service

import (
	"time"

	"github.com/yourusername/uilet/internal/model"
	"github.com/yourusername/uilet/internal/repository/postgres"
)

type ApartmentService struct {
	repo *postgres.ApartmentRepository
}

func NewApartmentService(repo *postgres.ApartmentRepository) *ApartmentService {
	return &ApartmentService{repo: repo}
}

func (s *ApartmentService) Create(userID uint, input model.CreateApartmentInput) error {
	apartment := &model.Apartment{
		UserID:      userID,
		Complex:     input.Complex,
		Rooms:       input.Rooms,
		Price:       input.Price,
		Description: input.Description,
		Address:     input.Address,
		Area:        input.Area,
		Floor:       input.Floor,
		Images:      input.Images,
		Amenities:   input.Amenities,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	return s.repo.Create(apartment)
}

func (s *ApartmentService) GetUserApartments(userID uint) ([]model.Apartment, error) {
	return s.repo.GetByUserID(userID)
}

func (s *ApartmentService) Update(userID uint, apartmentID string, input model.UpdateApartmentInput) error {
	return s.repo.Update(userID, apartmentID, &input)
}

func (s *ApartmentService) GetApartmentDetails(userID uint, apartmentID string) (*model.Apartment, error) {
	return s.repo.GetByID(userID, apartmentID)
}

func (s *ApartmentService) AddImages(userID uint, apartmentID string, imageURLs []string) error {
	return s.repo.AddImages(userID, apartmentID, imageURLs)
}
