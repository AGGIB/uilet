package handler

import (
    "net/http"
    "log"

    "github.com/gin-gonic/gin"
    "github.com/yourusername/uilet/internal/service"
)

type WhatsAppHandler struct {
    service *service.WhatsAppService
}

func NewWhatsAppHandler(service *service.WhatsAppService) *WhatsAppHandler {
    return &WhatsAppHandler{
        service: service,
    }
}

func (h *WhatsAppHandler) InitiateLogin(c *gin.Context) {
    userID, _ := c.Get("userID")

    qr, err := h.service.InitiateLogin(userID.(uint))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"qr": qr})
}

func (h *WhatsAppHandler) ConfigureAI(c *gin.Context) {
    userID, _ := c.Get("userID")
    var config service.AIConfig

    if err := c.BindJSON(&config); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if err := h.service.ConfigureAI(userID.(uint), config); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "AI configured successfully"})
}

func (h *WhatsAppHandler) TestAI(c *gin.Context) {
    var input struct {
        Message string `json:"message" binding:"required"`
    }

    if err := c.BindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
        return
    }

    log.Printf("Received test message: %s", input.Message)

    response, err := h.service.TestAI(input.Message)
    if err != nil {
        log.Printf("Error testing AI: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Ошибка при получении ответа от ИИ",
            "details": err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{"response": response})
} 