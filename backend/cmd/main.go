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
    "github.com/yourusername/uilet/pkg/ai"
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

    // Инициализация компонентов
    hasher := hash.NewPasswordHasher(10)
    tokenManager := jwt.NewTokenManager(cfg.JWTKey)
    userRepo := postgres.NewUserRepository(db)
    authService := service.NewAuthService(userRepo, hasher, tokenManager)

    // Создаем AI клиент
    log.Printf("Using OpenAI API Key: %s", cfg.OpenAIKey)
    aiClient := ai.NewClient(cfg.OpenAIKey)
    
    // Передаем AI клиент в WhatsApp сервис
    whatsappService := service.NewWhatsAppService(userRepo, aiClient)
    whatsappHandler := handler.NewWhatsAppHandler(whatsappService)

    // Инициализация хендлеров
    authHandler := handler.NewAuthHandler(authService)

    // Настройка роутера
    router := gin.Default()

    // CORS middleware
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3002", "https://uilet.kz"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:          12 * time.Hour,
    }))

    // Публичные роуты
    auth := router.Group("/auth")
    {
        auth.POST("/sign-up", authHandler.SignUp)
        auth.POST("/sign-in", authHandler.SignIn)
    }

    // Защищенные роуты
    api := router.Group("/api")
    api.Use(middleware.AuthMiddleware(tokenManager))
    {
        // Здесь будут защищенные эндпоинты
        api.GET("/user/profile", authHandler.GetProfile)
        api.PUT("/user/profile", authHandler.UpdateProfile)

        whatsapp := api.Group("/whatsapp")
        {
            whatsapp.POST("/login", whatsappHandler.InitiateLogin)
            whatsapp.POST("/ai/configure", whatsappHandler.ConfigureAI)
            whatsapp.POST("/ai/test", whatsappHandler.TestAI)
        }
    }

    // Запуск сервера
    if err := router.Run(":" + cfg.Port); err != nil {
        log.Fatalf("Error starting server: %v", err)
    }
} 