package whatsapp

import (
	"fmt"
	"strings"

	"github.com/Rhymen/go-whatsapp"
)

type MessageHandler struct {
	client    *Client
	aiHandler func(string) (string, error)
}

func newMessageHandler() *MessageHandler {
	return &MessageHandler{
		aiHandler: func(msg string) (string, error) {
			return "Default response", nil // Дефолтный обработчик
		},
	}
}

func (h *MessageHandler) SetClient(c *Client) {
	h.client = c
}

func (h *MessageHandler) SetAIHandler(handler func(string) (string, error)) {
	h.aiHandler = handler
}

func (h *MessageHandler) HandleError(err error) {
	fmt.Printf("Error occurred: %v\n", err)
}

func (h *MessageHandler) HandleTextMessage(message whatsapp.TextMessage) {
	// Игнорируем собственные сообщения
	if message.Info.FromMe {
		return
	}

	// Получаем текст сообщения
	text := message.Text

	// Обрабатываем сообщение через AI
	if h.aiHandler != nil {
		response, err := h.aiHandler(text)
		if err != nil {
			fmt.Printf("Error processing message with AI: %v\n", err)
			return
		}

		// Отправляем ответ
		sender := strings.Split(message.Info.RemoteJid, "@")[0]
		err = h.client.SendMessage(sender, response)
		if err != nil {
			fmt.Printf("Error sending response: %v\n", err)
		}
	}
}
