package config

import (
	"os"
	"github.com/joho/godotenv"
)

type Config struct {
	Port       string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTKey     string
	OpenAIKey  string
	DeepseekKey string
}

func LoadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, err
	}

	return &Config{
		Port:       getEnv("PORT", "8080"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "uilet"),
		JWTKey:     getEnv("JWT_KEY", "your-secret-key"),
		OpenAIKey:  getEnv("OPENAI_API_KEY", "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"),
		DeepseekKey: getEnv("DEEPSEEK_API_KEY", "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"),
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
} 