package controllers

import (
	"bytes"
	"encoding/json"
	"lms/backend/initializers"
	"lms/backend/middleware"
	"lms/backend/models"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func IntialiseRoutes(router *gin.Engine) *gin.Engine {

	protectedRoutes := router.Group("/api")
	protectedRoutes.Use(middleware.UserRetriveCookie)
	{
		admin := protectedRoutes.Group("/admin")
		admin.Use(middleware.AdminOnly)
		{
			admin.POST("/add-book", AddBook)
			admin.DELETE("/:id", RemoveBook)
		}
	}

	// router.Run(":8000")
	return router
}

func setupTestDB() {
	initializers.ConnectDatabase()
	initializers.DB.AutoMigrate(&models.Library{}, &models.User{})
	initializers.DB.AutoMigrate(&models.BookInventory{})
	initializers.DB.AutoMigrate(&models.RequestEvent{})
	initializers.DB.AutoMigrate(&models.IssueRegistry{})

	//Clearing table before execution
	initializers.DB.Exec("DELETE FROM users WHERE role!= 'admin' ")
	initializers.DB.Exec("DELETE FROM book_inventories")
}

func TestAddBook(t *testing.T) {
	setupTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)

	tests := []struct {
		name       string
		payload    string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		{
			name:       "Unauthorized Access",
			payload:    `{"isbn":"1234567890", "title":"Test Book", "authors":"Test Author", "publisher":"Test Publisher", "version":1}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "Only admin has the access to do so",
		},
		{
			name:       "Invalid JSON Format",
			payload:    `{"isbn":"1234567890", "title":"Test Book", "authors":"Test Author", "publisher":"Test Publisher", "version":"invalid"}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
			wantStatus: http.StatusBadRequest,
			wantKey:    "error",
			wantMsg:    "json: cannot unmarshal string into Go struct field BookInventory.version of type int",
		},
		{
			name:       "Unauthorized Access",
			payload:    `{"isbn":"1234567890", "title":"Test Book", "authors":"Test Author", "publisher":"Test Publisher", "version":1}`,
			headers:    map[string]string{},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "token contains an invalid number of segments",
		},
		{
			name:       "Successfully Adding a New Book",
			payload:    `{"isbn":"0987654321", "title":"New Book", "authors":"New Author", "publisher":"New Publisher", "version":1}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
			wantStatus: http.StatusCreated,
			wantKey:    "message",
			wantMsg:    "Book added successfully",
		},
		{
			name:       "Book Already Exists in Library",
			payload:    `{"isbn":"1234567890", "title":"Existing Book", "authors":"Existing Author", "publisher":"Existing Publisher", "version":1}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
			wantStatus: http.StatusOK,
			wantKey:    "message",
			wantMsg:    "Book copies updated successfully",
		},
		// {
		// 	name:       "Book with Same ISBN Exists in Different Library",
		// 	payload:    `{"isbn":"1234567890", "title":"New Book", "authors":"New Author", "publisher":"New Publisher", "version":1}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
		// 	wantStatus: http.StatusBadRequest,
		// 	wantKey:    "Message",
		// 	wantMsg:    "Same ISBN already exists, cannot add book.",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/api/admin/add-book", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			log.Println("Response", response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

func RemoveBookTest(t *testing.T) {
	setupTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)
	tests := []struct {
		name       string
		payload    string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		{
			name:       "Unauthorized Access",
			payload:    `{"isbn":"1234567890", "title":"Test Book", "authors":"Test Author", "publisher":"Test Publisher", "version":1}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "Only admin has the access to do so",
		},
		// {
		// 	name:       "Invalid JSON Format",
		// 	payload:    `{"isbn":"1234567890", "title":"Test Book", "authors":"Test Author", "publisher":"Test Publisher", "version":"invalid"}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
		// 	wantStatus: http.StatusBadRequest,
		// 	wantKey:    "error",
		// 	wantMsg:    "json: cannot unmarshal string into Go struct field BookInventory.version of type int",
		// },
		// {
		// 	name:       "Unauthorized Access",
		// 	payload:    `{"isbn":"1234567890", "title":"Test Book", "authors":"Test Author", "publisher":"Test Publisher", "version":1}`,
		// 	headers:    map[string]string{},
		// 	wantStatus: http.StatusUnauthorized,
		// 	wantKey:    "error",
		// 	wantMsg:    "token contains an invalid number of segments",
		// },
		// {
		// 	name:       "Successfully Adding a New Book",
		// 	payload:    `{"isbn":"0987654321", "title":"New Book", "authors":"New Author", "publisher":"New Publisher", "version":1}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
		// 	wantStatus: http.StatusCreated,
		// 	wantKey:    "message",
		// 	wantMsg:    "Book added successfully",
		// },
		// {
		// 	name:       "Book Already Exists in Library",
		// 	payload:    `{"isbn":"1234567890", "title":"Existing Book", "authors":"Existing Author", "publisher":"Existing Publisher", "version":1}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "message",
		// 	wantMsg:    "Book copies updated successfully",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("DE:ETE", "/:id", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			log.Println("Response", response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

// need to update remove book testing