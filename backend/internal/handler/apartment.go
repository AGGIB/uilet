package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/uilet/internal/model"
	"github.com/yourusername/uilet/internal/service"
)

type ApartmentHandler struct {
	service *service.ApartmentService
}

func NewApartmentHandler(service *service.ApartmentService) *ApartmentHandler {
	return &ApartmentHandler{service: service}
}

func (h *ApartmentHandler) Create(c *gin.Context) {
	userID, _ := c.Get("userID")
	var input model.CreateApartmentInput

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(userID.(uint), input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Объявление успешно создано"})
}

func (h *ApartmentHandler) GetUserApartments(c *gin.Context) {
	userID, _ := c.Get("userID")

	apartments, err := h.service.GetUserApartments(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, apartments)
}

func (h *ApartmentHandler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")
	apartmentID := c.Param("id")

	var input model.UpdateApartmentInput
	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Update(userID.(uint), apartmentID, input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Объявление успешно обновлено"})
}

func (h *ApartmentHandler) GetApartmentDetails(c *gin.Context) {
	apartmentID := c.Param("id")
	userID, _ := c.Get("userID")

	apartment, err := h.service.GetApartmentDetails(userID.(uint), apartmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, apartment)
}

func (h *ApartmentHandler) UploadImages(c *gin.Context) {
	apartmentID := c.Param("id")
	userID, _ := c.Get("userID")

	// Создаем директорию для загрузки, если её нет
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	files := form.File["images"]
	imageURLs := make([]string, 0)

	for _, file := range files {
		// Генерируем уникальное имя файла
		filename := fmt.Sprintf("%d_%s_%s", userID, apartmentID, file.Filename)
		filepath := filepath.Join(uploadDir, filename)

		// Сохраняем файл
		if err := c.SaveUploadedFile(file, filepath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		// Добавляем URL изображения
		imageURLs = append(imageURLs, "/uploads/"+filename)
	}

	if err := h.service.AddImages(userID.(uint), apartmentID, imageURLs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"images": imageURLs})
}
