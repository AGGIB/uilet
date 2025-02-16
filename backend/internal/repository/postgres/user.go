package postgres

import (
	"database/sql"
	"errors"

	"github.com/yourusername/uilet/internal/model"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user model.User) error {
	query := `
        INSERT INTO users (email, password_hash, name, phone, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `

	_, err := r.db.Exec(query,
		user.Email,
		user.Password,
		user.Name,
		user.Phone,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}

func (r *UserRepository) GetByEmail(email string) (model.User, error) {
	var user model.User
	query := `
        SELECT id, email, password_hash, name, phone, created_at, updated_at
        FROM users
        WHERE email = $1
    `

	err := r.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.Name,
		&user.Phone,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return user, errors.New("user not found")
	}

	return user, err
}

func (r *UserRepository) GetByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.QueryRow("SELECT id, email, name, phone FROM users WHERE id = $1", id).
		Scan(&user.ID, &user.Email, &user.Name, &user.Phone)
	if err != nil {
		return nil, err
	}
	return &user, nil
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