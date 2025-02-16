package hash

import "golang.org/x/crypto/bcrypt"

type PasswordHasher struct {
    cost int
}

func NewPasswordHasher(cost int) *PasswordHasher {
    return &PasswordHasher{cost: cost}
}

func (h *PasswordHasher) Hash(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
    return string(bytes), err
}

func (h *PasswordHasher) CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
} 