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
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.repo.Create(apartment); err != nil {
		return 0, fmt.Errorf("failed to create apartment: %v", err)
	}

	return apartment.ID, nil
}

func (s *ApartmentService) GetByUserID(userID uint) ([]model.Apartment, error) {
	apartments, err := s.repo.GetByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get apartments: %v", err)
	}
	return apartments, nil
}

func (s *ApartmentService) GetApartmentDetails(userID uint, apartmentID string) (*model.Apartment, error) {
	apartment, err := s.repo.GetByID(userID, apartmentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get apartment details: %v", err)
	}
	return apartment, nil
}

func (s *ApartmentService) Update(userID uint, apartmentID string, input model.UpdateApartmentInput) error {
	if err := s.repo.Update(userID, apartmentID, &input); err != nil {
		return fmt.Errorf("failed to update apartment: %v", err)
	}
	return nil
}

func (s *ApartmentService) UpdateAvailabilities(apartmentID uint, availabilities []model.AvailabilityInput) error {
	// Сначала удаляем все существующие записи о доступности для этой квартиры
	if err := s.repo.DeleteAvailabilities(apartmentID); err != nil {
		return fmt.Errorf("failed to delete old availabilities: %v", err)
	}

	// Добавляем новые записи
	for _, avail := range availabilities {
		dateStart, err := time.Parse("2006-01-02", avail.DateStart)
		if err != nil {
			return fmt.Errorf("invalid start date format: %v", err)
		}

		dateEnd, err := time.Parse("2006-01-02", avail.DateEnd)
		if err != nil {
			return fmt.Errorf("invalid end date format: %v", err)
		}

		availability := &model.Availability{
			DateStart: dateStart,
			DateEnd:   dateEnd,
			Status:    avail.Status,
		}

		if err := s.repo.CreateAvailability(apartmentID, availability); err != nil {
			return fmt.Errorf("failed to create availability: %v", err)
		}
	}

	return nil
}

func (s *ApartmentService) AddImages(userID uint, apartmentID string, imageData [][]byte, imageTypes []string) error {
	if err := s.repo.AddImages(userID, apartmentID, imageData, imageTypes); err != nil {
		return fmt.Errorf("failed to add images: %v", err)
	}
	return nil
}

func (s *ApartmentService) GetImage(apartmentID string, imageIndex string) ([]byte, string, error) {
	index := 0
	fmt.Sscanf(imageIndex, "%d", &index)
	return s.repo.GetImage(apartmentID, index)
}

func (s *ApartmentService) Delete(userID uint, apartmentID string) error {
	return s.repo.Delete(userID, apartmentID)
}

func (s *ApartmentService) DeleteImage(userID uint, apartmentID string, index int) error {
	if err := s.repo.DeleteImage(userID, apartmentID, index); err != nil {
		return fmt.Errorf("failed to delete image: %v", err)
	}
	return nil
}

func (s *ApartmentService) ToggleActive(userID uint, apartmentID string) error {
	return s.repo.ToggleActive(userID, apartmentID)
}
