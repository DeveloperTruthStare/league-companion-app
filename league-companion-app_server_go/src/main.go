package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

// Riot API configuration
var apiKey = "" // Replace with your actual Riot API key

func getBaseUrl(subdomain string) string {
	return "https://" + subdomain + ".api.riotgames.com"
}

func americasHandler(w http.ResponseWriter, r *http.Request) {
	proxyHandler(w, r, "americas")
}

func na1Handler(w http.ResponseWriter, r *http.Request) {
	proxyHandler(w, r, "na1")
}

func proxyHandler(w http.ResponseWriter, r *http.Request, subdomain string) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	// Construct the Riot API URL
	riotAPIPath := r.URL.Path[len("/"+subdomain+"/"):] // Remove the proxy prefix
	riotAPIURL := fmt.Sprintf("%s/%s", getBaseUrl(subdomain), riotAPIPath)

	// Include query parameters
	if r.URL.RawQuery != "" {
		riotAPIURL += "?" + r.URL.RawQuery
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
		fmt.Println("Failed to create request, API_KEY is probably expired")
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read response", http.StatusInternalServerError)
		return
	}

	// Forward response to client
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
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

	http.HandleFunc("/americas/", americasHandler)
	http.HandleFunc("/na1/", na1Handler)

	port := 80
	log.Printf("Proxy server running on port %d...", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
