package middleware

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/yourusername/uilet/pkg/jwt"
)

func AuthMiddleware(tokenManager *jwt.TokenManager) gin.HandlerFunc {
    return func(c *gin.Context) {
        header := c.GetHeader("Authorization")
        if header == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "empty auth header"})
            c.Abort()
            return
        }

        headerParts := strings.Split(header, " ")
        if len(headerParts) != 2 || headerParts[0] != "Bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid auth header"})
            c.Abort()
            return
        }

        userID, err := tokenManager.ValidateToken(headerParts[1])
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            c.Abort()
            return
        }

        c.Set("userID", userID)
        c.Next()
    }
} 