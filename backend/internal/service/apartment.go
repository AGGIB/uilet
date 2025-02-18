package service

import (
	"fmt"
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

func (s *ApartmentService) Create(userID uint, input model.CreateApartmentInput) (uint, error) {
	apartment := &model.Apartment{
		UserID:      userID,
		Complex:     input.Complex,
		Rooms:       input.Rooms,
		Price:       input.Price,
		Description: input.Description,
		Address:     input.Address,
		Area:        input.Area,
		Floor:       input.Floor,
		Amenities:   input.Amenities,
		Location:    input.Location,
		Rules:       input.Rules,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Images:      [][]byte{},
		ImageTypes:  []string{},
		ImageCount:  0,
	}

	if err := s.repo.Create(apartment); err != nil {
		return 0, err
	}

	return apartment.ID, nil
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

func (s *ApartmentService) AddImages(userID uint, apartmentID string, imageData [][]byte, imageTypes []string) error {
	return s.repo.AddImages(userID, apartmentID, imageData, imageTypes)
}

func (s *ApartmentService) GetImage(apartmentID string, imageIndex string) ([]byte, string, error) {
	index := 0
	fmt.Sscanf(imageIndex, "%d", &index)
	return s.repo.GetImage(apartmentID, index)
}

func (s *ApartmentService) Delete(userID uint, apartmentID string) error {
	return s.repo.Delete(userID, apartmentID)
}
