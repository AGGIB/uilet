package handler

import (
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

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

	// Если есть данные о доступности, сохраняем их
	if len(input.Availabilities) > 0 {
		if err := h.service.UpdateAvailabilities(apartmentID, input.Availabilities); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update availabilities: %v", err)})
			return
		}
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
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	apartments, err := h.service.GetByUserID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("failed to get apartments: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, apartments)
}

func (h *ApartmentHandler) Update(c *gin.Context) {
	userID, _ := c.Get("userID")
	apartmentID := c.Param("id")

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	var input model.UpdateApartmentInput
	if err := json.Unmarshal([]byte(form.Value["data"][0]), &input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
		return
	}

	// Обновляем данные объявления
	if err := h.service.Update(userID.(uint), apartmentID, input); err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "unauthorized") {
			status = http.StatusForbidden
		} else if strings.Contains(err.Error(), "not found") {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	// Обрабатываем новые изображения
	if files := form.File["images"]; len(files) > 0 {
		imageData := make([][]byte, 0, len(files))
		imageTypes := make([]string, 0, len(files))

		for _, file := range files {
			if !isAllowedImageType(file.Header.Get("Content-Type")) {
				continue
			}

			src, err := file.Open()
			if err != nil {
				continue
			}

			data, err := ioutil.ReadAll(src)
			src.Close()
			if err != nil {
				continue
			}

			imageData = append(imageData, data)
			imageTypes = append(imageTypes, file.Header.Get("Content-Type"))
		}

		if len(imageData) > 0 {
			if err := h.service.AddImages(userID.(uint), apartmentID, imageData, imageTypes); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save images"})
				return
			}
		}
	}

	// Получаем обновленные данные
	apartment, err := h.service.GetApartmentDetails(userID.(uint), apartmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated data"})
		return
	}

	c.JSON(http.StatusOK, apartment)
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

	// Генерируем ETag на основе ID и индекса
	etag := fmt.Sprintf("img-%s-%s", apartmentID, imageIndex)

	// Проверяем If-None-Match заголовок
	if match := c.GetHeader("If-None-Match"); match == etag {
		c.Status(http.StatusNotModified)
		return
	}

	image, contentType, err := h.service.GetImage(apartmentID, imageIndex)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.Status(http.StatusNotFound)
			return
		}
		c.Status(http.StatusInternalServerError)
		return
	}

	// Устанавливаем заголовки кэширования и сжатия
	c.Header("Cache-Control", "public, max-age=31536000, immutable")
	c.Header("ETag", etag)
	c.Header("Content-Type", contentType)
	c.Header("Vary", "Accept-Encoding")
	c.Header("Accept-Ranges", "bytes")

	// Поддержка частичной загрузки
	if rangeHeader := c.GetHeader("Range"); rangeHeader != "" {
		ranges, err := parseRange(rangeHeader, int64(len(image)))
		if err == nil && len(ranges) > 0 {
			r := ranges[0]
			c.Status(http.StatusPartialContent)
			c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", r.start, r.end-1, len(image)))
			c.Data(http.StatusPartialContent, contentType, image[r.start:r.end])
			return
		}
	}

	// Добавляем заголовок Content-Length для оптимизации загрузки
	c.Header("Content-Length", fmt.Sprintf("%d", len(image)))

	// Используем gzip сжатие для больших изображений
	if len(image) > 1024*10 && strings.Contains(c.GetHeader("Accept-Encoding"), "gzip") {
		c.Header("Content-Encoding", "gzip")
		gzipWriter := gzip.NewWriter(c.Writer)
		defer gzipWriter.Close()
		if _, err := gzipWriter.Write(image); err != nil {
			c.Status(http.StatusInternalServerError)
			return
		}
		return
	}

	c.Data(http.StatusOK, contentType, image)
}

type byteRange struct {
	start, end int64
}

func parseRange(rangeHeader string, size int64) ([]byteRange, error) {
	if !strings.HasPrefix(rangeHeader, "bytes=") {
		return nil, fmt.Errorf("invalid range header")
	}
	rangeHeader = strings.TrimPrefix(rangeHeader, "bytes=")
	ranges := strings.Split(rangeHeader, ",")
	parsedRanges := make([]byteRange, 0, len(ranges))

	for _, r := range ranges {
		r = strings.TrimSpace(r)
		if r == "" {
			continue
		}
		parts := strings.Split(r, "-")
		if len(parts) != 2 {
			continue
		}
		start, err := strconv.ParseInt(parts[0], 10, 64)
		if err != nil {
			continue
		}
		end := size
		if parts[1] != "" {
			end, err = strconv.ParseInt(parts[1], 10, 64)
			if err != nil {
				continue
			}
			end++
		}
		if start >= size || end > size || start >= end {
			continue
		}
		parsedRanges = append(parsedRanges, byteRange{start: start, end: end})
	}
	return parsedRanges, nil
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

func (h *ApartmentHandler) DeleteImage(c *gin.Context) {
	userID, _ := c.Get("userID")
	apartmentID := c.Param("id")
	imageIndex := c.Param("index")

	index, err := strconv.Atoi(imageIndex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid image index"})
		return
	}

	if err := h.service.DeleteImage(userID.(uint), apartmentID, index); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Image deleted successfully"})
}

func (h *ApartmentHandler) ToggleActive(c *gin.Context) {
	userID, _ := c.Get("userID")
	apartmentID := c.Param("id")

	err := h.service.ToggleActive(userID.(uint), apartmentID)
	if err != nil {
		if strings.Contains(err.Error(), "unauthorized") {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to toggle apartment status: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "status updated successfully"})
}
