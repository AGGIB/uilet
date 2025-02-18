package handler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

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

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Failed to parse form: %v", err)})
		return
	}

	// Получаем JSON данные
	dataStr := form.Value["data"][0]
	var input model.CreateApartmentInput
	if err := json.Unmarshal([]byte(dataStr), &input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid JSON: %v", err)})
		return
	}

	// Создаем объявление
	apartmentID, err := h.service.Create(userID.(uint), input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create apartment: %v", err)})
		return
	}

	// Обрабатываем изображения
	files := form.File["images"]
	fmt.Printf("Received %d images\n", len(files)) // Для отладки

	if len(files) > 0 {
		imageData := make([][]byte, 0, len(files))
		imageTypes := make([]string, 0, len(files))

		for i, file := range files {
			fmt.Printf("Processing image %d: %s, size: %d\n", i, file.Filename, file.Size) // Для отладки

			src, err := file.Open()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to open file: %v", err)})
				return
			}
			defer src.Close()

			data, err := ioutil.ReadAll(src)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to read file: %v", err)})
				return
			}

			imageData = append(imageData, data)
			imageTypes = append(imageTypes, file.Header.Get("Content-Type"))
		}

		// Сохраняем изображения
		if err := h.service.AddImages(userID.(uint), fmt.Sprintf("%d", apartmentID), imageData, imageTypes); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save images: %v", err)})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Объявление успешно создано",
		"id":      apartmentID,
	})
}

// Добавим вспомогательную функцию для проверки типа изображения
func isAllowedImageType(contentType string) bool {
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
	}
	return allowedTypes[contentType]
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

	dataStr := c.PostForm("data")
	if dataStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing form data"})
		return
	}

	var input model.UpdateApartmentInput
	if err := json.Unmarshal([]byte(dataStr), &input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid JSON: %v, data: %s", err, dataStr),
		})
		return
	}

	// Дополнительная проверка числовых полей
	if input.Rooms <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid number of rooms"})
		return
	}
	if input.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price"})
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

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	files := form.File["images"]
	imageData := make([][]byte, 0)
	imageTypes := make([]string, 0)

	for _, file := range files {
		// Открываем файл
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}
		defer src.Close()

		// Читаем содержимое файла
		data, err := ioutil.ReadAll(src)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
			return
		}

		imageData = append(imageData, data)
		imageTypes = append(imageTypes, file.Header.Get("Content-Type"))
	}

	if err := h.service.AddImages(userID.(uint), apartmentID, imageData, imageTypes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Images uploaded successfully"})
}

// Добавим новый обработчик для получения изображения
func (h *ApartmentHandler) GetImage(c *gin.Context) {
	apartmentID := c.Param("id")
	imageIndex := c.Param("index")

	fmt.Printf("Getting image for apartment %s, index %s\n", apartmentID, imageIndex) // Для отладки

	image, contentType, err := h.service.GetImage(apartmentID, imageIndex)
	if err != nil {
		fmt.Printf("Error getting image: %v\n", err) // Для отладки
		c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
		return
	}

	// Устанавливаем заголовки для кэширования
	c.Header("Cache-Control", "public, max-age=31536000")
	c.Header("Content-Type", contentType)
	c.Header("Content-Length", fmt.Sprintf("%d", len(image)))

	c.Data(http.StatusOK, contentType, image)
}

func (h *ApartmentHandler) Delete(c *gin.Context) {
	userID, _ := c.Get("userID")
	apartmentID := c.Param("id")

	if err := h.service.Delete(userID.(uint), apartmentID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Объявление успешно удалено"})
}
