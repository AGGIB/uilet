package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/yourusername/uilet/internal/model"
	"github.com/yourusername/uilet/internal/repository/postgres"
	"github.com/yourusername/uilet/pkg/hash"
	"github.com/yourusername/uilet/pkg/jwt"
)

type AuthService struct {
	repo         *postgres.UserRepository
	hasher       *hash.PasswordHasher
	tokenManager *jwt.TokenManager
}

func NewAuthService(repo *postgres.UserRepository, hasher *hash.PasswordHasher, tokenManager *jwt.TokenManager) *AuthService {
	return &AuthService{
		repo:         repo,
		hasher:       hasher,
		tokenManager: tokenManager,
	}
}

func (s *AuthService) SignUp(input model.SignUpInput) error {
	passwordHash, err := s.hasher.Hash(input.Password)
	if err != nil {
		return err
	}

	user := model.User{
		Email:     input.Email,
		Password:  passwordHash,
		Name:      input.Name,
		Phone:     input.Phone,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return s.repo.Create(user)
}

func (s *AuthService) SignIn(input model.SignInInput) (string, error) {
	user, err := s.repo.GetByEmail(input.Email)
	if err != nil {
		return "", errors.New("user not found")
	}

	if !s.hasher.CheckPassword(input.Password, user.Password) {
		return "", errors.New("invalid password")
	}

	token, err := s.tokenManager.GenerateToken(user.ID)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *AuthService) GetUserByID(userID uint) (*model.User, error) {
	user, err := s.repo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %v", err)
	}
	return user, nil
}

func (s *AuthService) UpdateProfile(userID uint, input model.UpdateProfileInput) error {
	return s.repo.UpdateProfile(userID, input)
} 