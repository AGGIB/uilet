package jwt

import (
    "time"
    "github.com/golang-jwt/jwt/v5"
)

type TokenManager struct {
    signingKey string
}

func NewTokenManager(signingKey string) *TokenManager {
    return &TokenManager{signingKey: signingKey}
}

type Claims struct {
    jwt.RegisteredClaims
    UserID uint `json:"user_id"`
}

func (m *TokenManager) GenerateToken(userID uint) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
        UserID: userID,
    })

    return token.SignedString([]byte(m.signingKey))
}

func (m *TokenManager) ValidateToken(tokenString string) (uint, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return []byte(m.signingKey), nil
    })

    if err != nil {
        return 0, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims.UserID, nil
    }

    return 0, jwt.ErrSignatureInvalid
} 