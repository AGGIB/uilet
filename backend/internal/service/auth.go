package service

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
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
	// Валидация email
	email := strings.TrimSpace(strings.ToLower(input.Email))
	if !isValidEmail(email) {
		return errors.New("некорректный формат email")
	}

	// Валидация пароля
	if err := validatePassword(input.Password); err != nil {
		return err
	}

	// Проверка существования пользователя
	if _, err := s.repo.GetByEmail(email); err == nil {
		return errors.New("пользователь с таким email уже существует")
	}

	// Хеширование пароля
	passwordHash, err := s.hasher.Hash(input.Password)
	if err != nil {
		return fmt.Errorf("ошибка при хешировании пароля")
	}

	user := &model.User{
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.repo.Create(user); err != nil {
		return fmt.Errorf("ошибка при создании пользователя")
	}

	return nil
}

func (s *AuthService) SignIn(input model.SignInInput) (string, error) {
	email := strings.TrimSpace(strings.ToLower(input.Email))
	if !isValidEmail(email) {
		return "", errors.New("некорректный формат email")
	}

	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return "", errors.New("неверный email или пароль")
	}

	if !s.hasher.CheckPassword(input.Password, user.PasswordHash) {
		return "", errors.New("неверный email или пароль")
	}

	token, err := s.tokenManager.GenerateToken(user.ID)
	if err != nil {
		return "", fmt.Errorf("ошибка при создании токена")
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

// Вспомогательные функции валидации
func isValidEmail(email string) bool {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	match, _ := regexp.MatchString(pattern, email)
	return match
}

func validatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("пароль должен содержать минимум 8 символов")
	}

	hasUpper := false
	hasLower := false
	hasNumber := false

	for _, char := range password {
		switch {
		case 'A' <= char && char <= 'Z':
			hasUpper = true
		case 'a' <= char && char <= 'z':
			hasLower = true
		case '0' <= char && char <= '9':
			hasNumber = true
		}
	}

	if !hasUpper || !hasLower || !hasNumber {
		return errors.New("пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру")
	}

	return nil
}

func isValidPhone(phone string) bool {
	pattern := `^(\+7|8)[0-9]{10}$`
	match, _ := regexp.MatchString(pattern, phone)
	return match
}
