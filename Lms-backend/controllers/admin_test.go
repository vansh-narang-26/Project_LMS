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
	// router.POST("/admin/add-book", AddBook)

	// Create a test admin user
	// testAdmin := models.User{
	// 	Name:  "Admin User",
	// 	Email: "admin1@example.com",
	// 	Role:  "admin",
	// 	LibID: 2,
	// }
	// initializers.DB.Create(&testAdmin)

	// Define test cases
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
