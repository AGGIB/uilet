package openai

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type Client struct {
    apiKey     string
    httpClient *http.Client
}

type ChatMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}

type ChatRequest struct {
    Model       string        `json:"model"`
    Messages    []ChatMessage `json:"messages"`
    Temperature float32       `json:"temperature"`
    MaxTokens   int          `json:"max_tokens"`
}

type ChatResponse struct {
    Choices []struct {
        Message ChatMessage `json:"message"`
    } `json:"choices"`
}

func NewClient(apiKey string) *Client {
    return &Client{
        apiKey:     apiKey,
        httpClient: &http.Client{},
    }
}

func (c *Client) CreateChatCompletion(systemPrompt, userMessage string, temperature float32, maxTokens int) (string, error) {
    url := "https://api.openai.com/v1/chat/completions"

    messages := []ChatMessage{
        {
            Role:    "system",
            Content: systemPrompt,
        },
        {
            Role:    "user",
            Content: userMessage,
        },
    }

    reqBody := ChatRequest{
        Model:       "gpt-3.5-turbo",
        Messages:    messages,
        Temperature: temperature,
        MaxTokens:   maxTokens,
    }

    jsonBody, err := json.Marshal(reqBody)
    if err != nil {
        return "", err
    }

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return "", err
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+c.apiKey)

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("OpenAI API error: %d", resp.StatusCode)
    }

    var response ChatResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return "", err
    }

    if len(response.Choices) == 0 {
        return "", fmt.Errorf("no response from OpenAI")
    }

    return response.Choices[0].Message.Content, nil
} 