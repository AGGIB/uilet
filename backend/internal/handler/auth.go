package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/uilet/internal/model"
	"github.com/yourusername/uilet/internal/service"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(service *service.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) SignUp(c *gin.Context) {
	var input model.SignUpInput

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Неверный формат данных",
			"details": "Проверьте правильность заполнения всех полей",
		})
		return
	}

	if err := h.service.SignUp(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Пользователь успешно создан",
	})
}

func (h *AuthHandler) SignIn(c *gin.Context) {
	var input model.SignInInput

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Неверный формат данных",
			"details": "Проверьте правильность email и пароля",
		})
		return
	}

	token, err := h.service.SignIn(input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   token,
		"message": "Вход выполнен успешно",
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	user, err := h.service.GetUserByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")
	var input model.UpdateProfileInput

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.UpdateProfile(userID.(uint), input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "profile updated successfully"})
}
