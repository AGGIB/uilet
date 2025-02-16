package model

import "time"

type User struct {
    ID           uint      `json:"id" db:"id"`
    Email        string    `json:"email" db:"email"`
    Password     string    `json:"-" db:"password_hash"`
    Name         string    `json:"name" db:"name"`
    Phone        string    `json:"phone" db:"phone"`
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type SignUpInput struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
    Name     string `json:"name" binding:"required"`
    Phone    string `json:"phone" binding:"required"`
}

type SignInInput struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type UpdateProfileInput struct {
    Name  string `json:"name"`
    Phone string `json:"phone"`
} 