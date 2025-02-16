package deepseek

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "log"
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
    Model    string        `json:"model"`
    Messages []ChatMessage `json:"messages"`
}

type ChatResponse struct {
    Choices []struct {
        Message struct {
            Content string `json:"content"`
            Role    string `json:"role"`
        } `json:"message"`
    } `json:"choices"`
}

type ErrorResponse struct {
    Error struct {
        Message string `json:"message"`
        Type    string `json:"type"`
        Code    string `json:"code"`
    } `json:"error"`
}

func NewClient(apiKey string) *Client {
    return &Client{
        apiKey:     apiKey,
        httpClient: &http.Client{},
    }
}

func (c *Client) CreateChatCompletion(systemPrompt, userMessage string, temperature float32, maxTokens int) (string, error) {
    url := "https://openrouter.ai/api/v1/chat/completions"

    messages := []ChatMessage{
        {
            Role:    "user",
            Content: userMessage,
        },
    }

    if systemPrompt != "" {
        messages = append([]ChatMessage{{
            Role:    "system",
            Content: systemPrompt,
        }}, messages...)
    }

    reqBody := ChatRequest{
        Model:    "anthropic/claude-3-haiku-20240307",
        Messages: messages,
    }

    jsonBody, err := json.Marshal(reqBody)
    if err != nil {
        return "", fmt.Errorf("error marshaling request: %v", err)
    }

    log.Printf("Making request to: %s", url)
    log.Printf("Request body: %s", string(jsonBody))

    req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
    if err != nil {
        return "", fmt.Errorf("error creating request: %v", err)
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.apiKey))
    req.Header.Set("HTTP-Referer", "https://uilet.kz")
    req.Header.Set("X-Title", "Uilet AI Assistant")
    req.Header.Add("Accept", "application/json")

    log.Printf("Request headers: %v", req.Header)

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return "", fmt.Errorf("error making request: %v", err)
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return "", fmt.Errorf("error reading response body: %v", err)
    }

    log.Printf("Response status: %d", resp.StatusCode)
    log.Printf("Response body: %s", string(body))

    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
    }

    var response ChatResponse
    if err := json.Unmarshal(body, &response); err != nil {
        return "", fmt.Errorf("error parsing response: %v (body: %s)", err, string(body))
    }

    if len(response.Choices) == 0 {
        return "", fmt.Errorf("no choices in response: %s", string(body))
    }

    return response.Choices[0].Message.Content, nil
} 