package service

import (
    "fmt"
    "sync"
    "log"

    "github.com/yourusername/uilet/internal/whatsapp"
    "github.com/yourusername/uilet/pkg/ai"
    "github.com/yourusername/uilet/internal/repository/postgres"
)

type WhatsAppService struct {
    client    *whatsapp.Client
    userRepo  *postgres.UserRepository
    aiClient  *ai.Client
    aiConfigs map[uint]AIConfig
    mu        sync.RWMutex
}

type AIConfig struct {
    Prompt      string  `json:"prompt"`
    Temperature float32 `json:"temperature"`
    MaxTokens   int     `json:"max_tokens"`
}

func NewWhatsAppService(userRepo *postgres.UserRepository, aiClient *ai.Client) *WhatsAppService {
    service := &WhatsAppService{
        client:    whatsapp.NewClient(),
        userRepo:  userRepo,
        aiClient:  aiClient,
        aiConfigs: make(map[uint]AIConfig),
    }

    service.client.SetMessageHandler(service.handleAIMessage)
    return service
}

func (s *WhatsAppService) handleAIMessage(message string) (string, error) {
    defaultConfig := AIConfig{
        Prompt:      "Вы - помощник по аренде недвижимости. Отвечайте кратко и по делу на русском языке.",
        Temperature: 0.7,
        MaxTokens:   150,
    }

    response, err := s.aiClient.CreateChatCompletion(defaultConfig.Prompt, message)
    if err != nil {
        log.Printf("AI error details: %v", err)
        return "", fmt.Errorf("Ошибка ИИ: %v", err)
    }

    return response, nil
}

func (s *WhatsAppService) ConfigureAI(userID uint, config AIConfig) error {
    s.mu.Lock()
    defer s.mu.Unlock()

    s.aiConfigs[userID] = config
    return nil
}

func (s *WhatsAppService) TestAI(message string) (string, error) {
    defaultConfig := AIConfig{
        Prompt:      "Вы - помощник по аренде недвижимости. Отвечайте кратко и по делу на русском языке.",
        Temperature: 0.7,
        MaxTokens:   150,
    }

    log.Printf("Sending message to AI: %s", message)
    response, err := s.aiClient.CreateChatCompletion(defaultConfig.Prompt, message)
    if err != nil {
        log.Printf("AI error details: %v", err)
        return "", fmt.Errorf("Ошибка ИИ: %v", err)
    }

    log.Printf("Received AI response: %s", response)
    return response, nil
}

func (s *WhatsAppService) InitiateLogin(userID uint) (string, error) {
    err := s.client.Connect()
    if err != nil {
        return "", fmt.Errorf("failed to connect: %v", err)
    }

    qr, err := s.client.Login()
    if err != nil {
        return "", fmt.Errorf("failed to get QR code: %v", err)
    }

    return qr, nil
} 