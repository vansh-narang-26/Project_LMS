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

func TestRaiseIssueRequest(t *testing.T) {
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
			name:       "No book available",
			query:      "qaa",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ"},
			wantStatus: http.StatusNotFound,
			wantKey:    "Message",
			wantMsg:    "Book not with this isbn",
		},
		{
			name:       "Already issued",
			query:      "11",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ"},
			wantStatus: http.StatusBadGateway,
			wantKey:    "Message",
			wantMsg:    "The book has been already issued to you",
		},
		// {
		// 	name:       "Already requested",
		// 	query:      "12",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ"},
		// 	wantStatus: http.StatusBadRequest,
		// 	wantKey:    "Message",
		// 	wantMsg:    "The book has been already requested by you",
		// },
		{
			name:       "Request created",
			query:      "aa", //book which is not avialable
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InIyQGdtYWlsLmNvbSIsImlkIjoyMiwicm9sZSI6InJlYWRlciJ9.J3-92_iRT7sAJUBV3fxkHi_4kz3bCxNz6kDPBTSLeJQ"},
			wantStatus: http.StatusNotFound,
			wantKey:    "Message",
			wantMsg:    "Book is not available you request has been denied",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/reader/raise-request/"+tt.query, nil)

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
		// 	name:       "User not found",
		// 	query:      "",
		// 	headers:    map[string]string{},
		// 	wantStatus: http.StatusNotFound,
		// 	wantKey:    "",
		// 	wantMsg:    "",
		// },
		// {
		// 	name:       "Return date found",
		// 	query:      "aa",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJAZ21haWwuY29tIiwiaWQiOjE0LCJyb2xlIjoicmVhZGVyIn0.jrIA4JTYaEGhtaCV_vSxBe9vuFwUK4enWMGxHHW3ChA"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "return_date",
		// 	wantMsg:    "",
		// },
		// {
		// 	name:       "Book not found",
		// 	query:      "nonexistent",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJAZ21haWwuY29tIiwiaWQiOjE0LCJyb2xlIjoicmVhZGVyIn0.jrIA4JTYaEGhtaCV_vSxBe9vuFwUK4enWMGxHHW3ChA"},
		// 	wantStatus: http.StatusNotFound,
		// 	wantKey:    "Message",
		// 	wantMsg:    "Couldnt find book with this isbn",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/reader/return-date/"+tt.query, nil)

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
