package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/joho/godotenv"
	"github.com/patrickmn/go-cache"
	"golang.org/x/time/rate"
)

// Riot API configuration
var apiKey = "" // Replace with your actual Riot API key
const (
	baseURL    = "https://americas.api.riotgames.com" // Adjust based on region
	rateLimit  = 20                                   // Max requests per window
	windowTime = time.Minute                          // Riot API rate limit window
)

// Rate limiter
var limiter = rate.NewLimiter(rate.Every(windowTime/time.Duration(rateLimit)), rateLimit)

// Cache for API responses
var apiCache = cache.New(10*time.Minute, 15*time.Minute)

// Mutex for synchronizing cache access
var cacheMutex sync.Mutex

// Proxy handler
func proxyHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	// Construct the Riot API URL
	riotAPIPath := r.URL.Path[len("/riot/"):] // Remove the proxy prefix
	riotAPIURL := fmt.Sprintf("%s/%s", baseURL, riotAPIPath)

	// Include query parameters
	if r.URL.RawQuery != "" {
		riotAPIURL += "?" + r.URL.RawQuery
	}

	// Check if response is cached
	cacheMutex.Lock()
	if cachedResponse, found := apiCache.Get(riotAPIURL); found {
		cacheMutex.Unlock()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(cachedResponse.([]byte))
		return
	}
	cacheMutex.Unlock()

	// Enforce rate limit
	if err := limiter.Wait(r.Context()); err != nil {
		http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
		return
	}

	// Make the actual API request
	req, err := http.NewRequest("GET", riotAPIURL, nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}

	req.Header.Set("X-Riot-Token", apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Failed to fetch from Riot API", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response", http.StatusInternalServerError)
		return
	}

	// Cache the response only for successful requests
	if resp.StatusCode == http.StatusOK {
		cacheMutex.Lock()
		apiCache.Set(riotAPIURL, body, 5*time.Minute) // Adjust cache duration as needed
		cacheMutex.Unlock()
	}

	// Forward response to client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

const CHAMPIONS = "champion"
const ITEMS = "item"
const STYLES = "styles"
const SPELL = "spell"

func staticHandler(w http.ResponseWriter, r *http.Request) {
	pathPortion := r.URL.Path[len("/static/"):]
	parts := strings.Split(pathPortion, "/")

	switch parts[0] {
	case CHAMPIONS:
		championName := strings.ToUpper(parts[1][:1]) + parts[1][1:]
		fmt.Println(championName)
		http.ServeFile(w, r, fmt.Sprintf("./assets/champion/%s.png", championName))
	case ITEMS:
		http.ServeFile(w, r, fmt.Sprintf("./assets/item/%s.png", parts[1]))
	case STYLES:
		http.ServeFile(w, r, fmt.Sprintf("./assets/perk-images/Styles/%s.png", parts[1]))
	case SPELL:
		http.ServeFile(w, r, fmt.Sprintf("./assets/spell/%s.png", parts[1]))
	default:
		http.Error(w, "could not find thingy", http.StatusNotFound)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	apiKey = os.Getenv("RIOT_API_KEY")
	if apiKey == "" {
		log.Fatal("API key not found in .env file")
	}

	http.HandleFunc("/static/", staticHandler)
	http.HandleFunc("/riot/", proxyHandler)

	port := 8080
	log.Printf("Proxy server running on port %d...", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
