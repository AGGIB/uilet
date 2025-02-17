package postgres

import (
	"database/sql"
	"fmt"

	"github.com/yourusername/uilet/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
	query := `
        INSERT INTO users (email, password_hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `

	err := r.db.QueryRow(
		query,
		user.Email,
		user.PasswordHash,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)

	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

func (r *UserRepository) GetByEmail(email string) (*model.User, error) {
	user := &model.User{}
	query := `
        SELECT id, email, password_hash, created_at, updated_at
        FROM users WHERE email = $1
    `

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	}

	if err != nil {
		return nil, fmt.Errorf("database error: %v", err)
	}

	return user, nil
}

func (r *UserRepository) GetByID(id uint) (*model.User, error) {
	user := &model.User{}
	query := `
        SELECT id, email, created_at, updated_at
        FROM users WHERE id = $1
    `

	err := r.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	return user, nil
}

func (r *UserRepository) UpdateProfile(userID uint, input model.UpdateProfileInput) error {
	_, err := r.db.Exec(
		"UPDATE users SET name = $1, phone = $2 WHERE id = $3",
		input.Name,
		input.Phone,
		userID,
	)
	return err
}
