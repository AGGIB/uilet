package utils

import (
	"sync"
	"time"
)

type CacheItem struct {
	Data      []byte
	Type      string
	Timestamp time.Time
}

type ImageCache struct {
	cache  map[string]CacheItem
	mutex  sync.RWMutex
	maxAge time.Duration
}

var (
	defaultCache *ImageCache
	once         sync.Once
)

func GetImageCache() *ImageCache {
	once.Do(func() {
		defaultCache = NewImageCache(24 * time.Hour) // Кэш на 24 часа
	})
	return defaultCache
}

func NewImageCache(maxAge time.Duration) *ImageCache {
	cache := &ImageCache{
		cache:  make(map[string]CacheItem),
		maxAge: maxAge,
	}
	go cache.startCleanup()
	return cache
}

func (c *ImageCache) Set(key string, data []byte, contentType string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.cache[key] = CacheItem{
		Data:      data,
		Type:      contentType,
		Timestamp: time.Now(),
	}
}

func (c *ImageCache) Get(key string) ([]byte, string, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	if item, exists := c.cache[key]; exists {
		if time.Since(item.Timestamp) < c.maxAge {
			return item.Data, item.Type, true
		}
		// Если кэш устарел, удаляем его
		delete(c.cache, key)
	}
	return nil, "", false
}

func (c *ImageCache) Delete(key string) {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	delete(c.cache, key)
}

func (c *ImageCache) startCleanup() {
	ticker := time.NewTicker(time.Hour)
	for range ticker.C {
		c.cleanup()
	}
}

func (c *ImageCache) cleanup() {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	now := time.Now()
	for key, item := range c.cache {
		if now.Sub(item.Timestamp) > c.maxAge {
			delete(c.cache, key)
		}
	}
}
