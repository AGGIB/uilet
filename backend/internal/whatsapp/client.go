package whatsapp

import (
	_ "encoding/base64"
	"fmt"
	"sync"
	"time"

	"github.com/Rhymen/go-whatsapp"
)

type Client struct {
	conn      *whatsapp.Conn
	session   *whatsapp.Session
	handler   *MessageHandler
	qrChannel chan string
	connected bool
	mu        sync.RWMutex
}

func NewClient() *Client {
	return &Client{
		qrChannel: make(chan string),
		handler:   newMessageHandler(),
	}
}

func (c *Client) Connect() error {
	wac, err := whatsapp.NewConn(20 * time.Second)
	if err != nil {
		return fmt.Errorf("error creating connection: %v", err)
	}

	c.conn = wac
	c.handler.SetClient(c)
	c.conn.AddHandler(c.handler)

	return nil
}

func (c *Client) Login() (string, error) {
	if c.conn == nil {
		return "", fmt.Errorf("connection not initialized")
	}

	qr := make(chan string)
	go func() {
		session, err := c.conn.Login(qr)
		if err != nil {
			fmt.Printf("Error during login: %v\n", err)
			return
		}
		c.mu.Lock()
		c.session = &session
		c.connected = true
		c.mu.Unlock()
	}()

	return <-qr, nil
}

func (c *Client) SendMessage(phone string, message string) error {
	if !c.IsConnected() {
		return fmt.Errorf("not connected to WhatsApp")
	}

	msg := whatsapp.TextMessage{
		Info: whatsapp.MessageInfo{
			RemoteJid: phone + "@s.whatsapp.net",
		},
		Text: message,
	}

	_, err := c.conn.Send(msg)
	return err
}

func (c *Client) IsConnected() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.connected
}

func (c *Client) SetMessageHandler(handler func(string) (string, error)) {
	c.handler.SetAIHandler(handler)
}
