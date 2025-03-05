package controllers

import (
	"bytes"
	"encoding/json"
	"lms/backend/initializers"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCreateLibrary(t *testing.T) {
	setupTestDB()
	initializers.DB.Exec("DELETE FROM users WHERE role!= 'admin' ")

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
			name:       "Owner Already Has Library",
			payload:    `{"name":"skdd"}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjksInJvbGUiOiJvd25lciJ9.eRndaP1GVyZ4rWEU8TO3-RvDk6IKHTp7SBEWBEFWEkk"},
			wantStatus: http.StatusBadRequest,
			wantKey:    "Message",
			wantMsg:    "Library with this name already exists",
		},
		{
			name:       "Library With Same Name Exists",
			payload:    `{"name":"Test Existing Libraryiu"}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjksInJvbGUiOiJvd25lciJ9.eRndaP1GVyZ4rWEU8TO3-RvDk6IKHTp7SBEWBEFWEkk"},
			wantStatus: http.StatusBadRequest,
			wantKey:    "Message",
			wantMsg:    "Library with this name already exists",
		},
		// {
		// 	name:       "Invalid JSON Format",
		// 	payload:    `{"name": invalid}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxAZ21haWwuY29tIiwiaWQiOjExLCJyb2xlIjoib3duZXIifQ.QjxYQDhX5H9aKzJCW-VX_CAkFZ5RYRUNZ2KZPaOf8ow"},
		// 	wantStatus: http.StatusBadRequest,
		// 	wantKey:    "error",
		// 	wantMsg:    "User not found",
		// },
		{
			name:       "Unauthorized Request",
			payload:    `{"name":"Unauthorized Library"}`,
			headers:    map[string]string{},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "token contains an invalid number of segments",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/api/library/create", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")

			// Add headers dynamically
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Contains(t, response, tt.wantKey)
			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

func TestCreateAdmin(t *testing.T) {
	setupTestDB1()
	initializers.DB.Exec("DELETE FROM users WHERE email='vannii@gmail.com'")

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
			name:       "Email already exists",
			payload:    `{"email":"o@gmail.com"}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusBadRequest,
			wantKey:    "Error",
			wantMsg:    "already exists with the same email",
		},
		{
			name:       "Create admin",
			payload:    `{"name":"vansh","email":"vannii@gmail.com","contact_no":"9466"}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusOK,
			wantKey:    "Message",
			wantMsg:    "Admin created successfully",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/api/library/create-admin", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")

			// Add headers dynamically
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Contains(t, response, tt.wantKey)
			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

func TestGetLib(t *testing.T) {
	setupTestDB1()

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
			name:       "Library not found",
			payload:    "",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusNotFound,
			wantKey:    "Message",
			wantMsg:    "Library doesnot exist",
		},
		// {
		// 	name:       "Library found",
		// 	payload:    "",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "",
		// 	wantMsg:    "",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/library/getlib", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")

			// Add headers dynamically
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Contains(t, response, tt.wantKey)
			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

func TestGetAdmins(t *testing.T) {
	setupTestDB1()

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
			name:       "Found the admins",
			payload:    "",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusOK,
			wantKey:    "Message",
			wantMsg:    "Admins found",
		},
		{
			name:       "User not found",
			payload:    "",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImxwQGdtYWlsLmNvbSIsImlkIjoxOCwicm9sZSI6Im93bmVyIn0.tmapn513k39lv7lFCLmXmBdZVKXXhl7LtvAxDc8BZGg"},
			wantStatus: http.StatusNotFound,
			wantKey:    "Message",
			wantMsg:    "Couldnt find logged in user",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/library/getAdmins", bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")

			// Add headers dynamically
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Contains(t, response, tt.wantKey)
			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}
