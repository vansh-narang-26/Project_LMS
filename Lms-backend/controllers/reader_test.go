package controllers

import (
	"encoding/json"
	"lms/backend/initializers"
	"lms/backend/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestDB1() {
	initializers.ConnectDatabase()
	initializers.DB.AutoMigrate(&models.Library{}, &models.User{})
	initializers.DB.AutoMigrate(&models.BookInventory{})
	initializers.DB.AutoMigrate(&models.RequestEvent{})
	initializers.DB.AutoMigrate(&models.IssueRegistry{})

	//Clearing table before execution
	// initializers.DB.Exec("DELETE FROM users WHERE role!= 'admin' ")
	//initializers.DB.Exec("DELETE FROM book_inventories")
}

func TestSearchBooks(t *testing.T) {
	setupTestDB1()
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)

	tests := []struct {
		name       string
		query      string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		{
			name:       "Book Found",
			query:      "?q=TestBook",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxyQGdtYWlsLmNvbSIsImlkIjoxMiwicm9sZSI6InJlYWRlciJ9.y9rVXXZrmiqERxLsPtt9I9NSbNUq6Jiu7pauN7iGoKM"},
			wantStatus: http.StatusOK,
			wantKey:    "Books",
			wantMsg:    "",
		},
		// {
		// 	name:       "No Book Found",
		// 	query:      "?q=NonExistent",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxyQGdtYWlsLmNvbSIsImlkIjoxMiwicm9sZSI6InJlYWRlciJ9.y9rVXXZrmiqERxLsPtt9I9NSbNUq6Jiu7pauN7iGoKM"},
		// 	wantStatus: http.StatusBadGateway,
		// 	wantKey:    "Message",
		// 	wantMsg:    "No book found",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/reader/search-books"+tt.query, nil)

			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Contains(t, response, tt.wantKey)
			if tt.wantMsg != "" {
				assert.Equal(t, tt.wantMsg, response[tt.wantKey])
			}
		})
	}
}

// func TestRaiseIssueRequest(t *testing.T) {
// 	setupTestDB1()
// 	gin.SetMode(gin.TestMode)
// 	router := gin.Default()
// 	IntialiseRoutes(router)

// 	w := httptest.NewRecorder()
// 	req, _ := http.NewRequest("GET", "/api/reader/raise-request/aa", nil)
// 	req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ")

// 	router.ServeHTTP(w, req)

// 	assert.Equal(t, http.StatusCreated, w.Code)
// 	var response map[string]interface{}
// 	json.Unmarshal(w.Body.Bytes(), &response)
// 	assert.Contains(t, response, "error")
// 	assert.Equal(t, "Request created successfully", response["Request created successfully"])
// }

func TestGetLibraries(t *testing.T) {
	setupTestDB1()
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/getLib", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Contains(t, response, "libraries")
}

func TestGetReturnDate(t *testing.T) {
	setupTestDB1()
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)

	tests := []struct {
		name       string
		query      string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		// {
		// 	name:       "Return date",
		// 	query:      "1",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJAZ21haWwuY29tIiwiaWQiOjE0LCJyb2xlIjoicmVhZGVyIn0.jrIA4JTYaEGhtaCV_vSxBe9vuFwUK4enWMGxHHW3ChA"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "return_date",
		// 	wantMsg:    "",
		// },
		// {
		// 	name:       "Return date",
		// 	query:      "1",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ"},
		// 	wantStatus: http.StatusNotFound,
		// 	wantKey:    "Message",
		// 	wantMsg:    "Couldnt find book with this isbn",
		// },
		// {
		// 	name:       "Return date",
		// 	query:      "aa",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "return_date",
		// 	wantMsg:    "",
		// },
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/return-date/"+tt.query, nil)

			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Contains(t, response, tt.wantKey)
			if tt.wantMsg != "" {
				assert.Equal(t, tt.wantMsg, response[tt.wantKey])
			}
		})
	}
}
