package controllers

import (
	"bytes"
	"encoding/json"
	"lms/backend/initializers"
	"lms/backend/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// func setupTestDB() {
// 	initializers.ConnectDatabase()
// 	initializers.DB.AutoMigrate(&models.Library{}, &models.User{})
// 	initializers.DB.AutoMigrate(&models.BookInventory{})
// 	initializers.DB.AutoMigrate(&models.RequestEvent{})
// 	initializers.DB.AutoMigrate(&models.IssueRegistry{})

// 	//Clearing table before execution
// 	initializers.DB.Exec("DELETE FROM users")
// }

func TestCreateUser(t *testing.T) {
	setupTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/users/register", CreateUser)

	userData := `{"name":"Test User", "email":"test@example.com", "contactNumber":"1234567890", "role":"reader", "libID":3}`
	req, _ := http.NewRequest("POST", "/users/register", bytes.NewBuffer([]byte(userData)))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)

	data, ok := response["data"].(map[string]interface{})
	assert.True(t, ok)

	assert.Equal(t, "Test User", data["name"])
	assert.Equal(t, "test@example.com", data["email"])
}

func TestLoginUser(t *testing.T) {
	setupTestDB()

	// Cleaning again
	initializers.DB.Where("email = ?", "login@example.com").Delete(&models.User{})

	// Create a test user
	testUser := models.User{
		Name:          "Login User",
		Email:         "login@example.com",
		ContactNumber: "9876543210",
		Role:          "reader",
		LibID:         1,
	}
	initializers.DB.Create(&testUser)

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/users/login", LoginUser)

	// Define test cases
	tests := []struct {
		name       string
		payload    string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		{"Valid Login", `{"email":"login@example.com"}`, http.StatusOK, "message", "Logged in successfully"},
		{"Invalid Email", `{"email":"unknown@example.com"}`, http.StatusBadGateway, "Error", "No user exists"},
		// {"Empty Request", `{}`, http.StatusBadGateway, "error", "Invalid request body"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/users/login", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}
