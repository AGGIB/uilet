package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/yourusername/uilet/internal/config"
	"github.com/yourusername/uilet/internal/handler"
	"github.com/yourusername/uilet/internal/repository/postgres"
	"github.com/yourusername/uilet/internal/service"
	"github.com/yourusername/uilet/pkg/hash"
	"github.com/yourusername/uilet/pkg/jwt"
	"github.com/yourusername/uilet/pkg/middleware"
)

func main() {
	// Загрузка конфигурации
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	// Подключение к базе данных
	dbURL := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName)

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer db.Close()

	// Проверка соединения с базой
	if err := db.Ping(); err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}

	log.Println("Successfully connected to database")

	// Инициализация компонентов
	hasher := hash.NewPasswordHasher(10)
	tokenManager := jwt.NewTokenManager(cfg.JWTKey)
	userRepo := postgres.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, hasher, tokenManager)
	authHandler := handler.NewAuthHandler(authService)
	apartmentRepo := postgres.NewApartmentRepository(db)
	apartmentService := service.NewApartmentService(apartmentRepo)
	apartmentHandler := handler.NewApartmentHandler(apartmentService)

	// Настройка роутера
	router := gin.Default()

	// Настройка CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Публичные роуты
	auth := router.Group("/auth")
	{
		auth.POST("/sign-up", authHandler.SignUp)
		auth.POST("/sign-in", authHandler.SignIn)
	}

	// Публичные роуты для изображений
	router.GET("/api/apartments/:id/images/:index", apartmentHandler.GetImage)

	// Защищенные роуты
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware(tokenManager))
	{
		api.GET("/user/profile", authHandler.GetProfile)
		api.PUT("/user/profile", authHandler.UpdateProfile)
		api.POST("/apartments", apartmentHandler.Create)
		api.GET("/apartments", apartmentHandler.GetUserApartments)
		api.PUT("/apartments/:id", apartmentHandler.Update)
		api.GET("/apartments/:id", apartmentHandler.GetApartmentDetails)
		api.POST("/apartments/:id/images", apartmentHandler.UploadImages)
		api.DELETE("/apartments/:id", apartmentHandler.Delete)
		api.DELETE("/apartments/:id/images/:index", apartmentHandler.DeleteImage)
	}

	// В функции main после инициализации роутера
	router.Static("/uploads", "./uploads")

	// Запуск сервера
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
