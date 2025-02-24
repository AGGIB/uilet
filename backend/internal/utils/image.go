package utils

import (
	"bytes"
	"fmt"
	"image"
	_ "image/gif"
	"image/jpeg"
	"image/png"
)

const (
	MaxWidth  = 1920
	MaxHeight = 1080
	Quality   = 85
)

// OptimizeImage оптимизирует изображение
func OptimizeImage(imageData []byte) ([]byte, error) {
	// Читаем изображение
	img, format, err := image.Decode(bytes.NewReader(imageData))
	if err != nil {
		return nil, fmt.Errorf("error decoding image: %v", err)
	}

	// Получаем текущие размеры
	bounds := img.Bounds()
	width := bounds.Dx()
	height := bounds.Dy()

	// Если изображение меньше максимальных размеров, возвращаем как есть
	if width <= MaxWidth && height <= MaxHeight {
		return imageData, nil
	}

	// Вычисляем новые размеры
	newWidth, newHeight := calculateDimensions(width, height)

	// Создаем новое изображение с новыми размерами
	resized := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))

	// Простое масштабирование (в реальном проекте лучше использовать более качественный алгоритм)
	for y := 0; y < newHeight; y++ {
		for x := 0; x < newWidth; x++ {
			srcX := x * width / newWidth
			srcY := y * height / newHeight
			resized.Set(x, y, img.At(srcX, srcY))
		}
	}

	// Сохраняем результат
	var buf bytes.Buffer
	switch format {
	case "jpeg":
		err = jpeg.Encode(&buf, resized, &jpeg.Options{Quality: Quality})
	case "png":
		err = png.Encode(&buf, resized)
	default:
		// Для других форматов возвращаем оригинал
		return imageData, nil
	}

	if err != nil {
		return nil, fmt.Errorf("error encoding image: %v", err)
	}

	optimized := buf.Bytes()
	// Если оптимизированное изображение больше оригинала, возвращаем оригинал
	if len(optimized) > len(imageData) {
		return imageData, nil
	}

	return optimized, nil
}

// calculateDimensions вычисляет новые размеры с сохранением пропорций
func calculateDimensions(width, height int) (int, int) {
	if width <= MaxWidth && height <= MaxHeight {
		return width, height
	}

	ratio := float64(width) / float64(height)

	if width > MaxWidth {
		width = MaxWidth
		height = int(float64(width) / ratio)
	}

	if height > MaxHeight {
		height = MaxHeight
		width = int(float64(height) * ratio)
	}

	return width, height
}

// IsWebPSupported проверяет поддержку WebP в заголовке Accept
func IsWebPSupported(accept string) bool {
	return bytes.Contains([]byte(accept), []byte("image/webp"))
}
