package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCreateLibrary(t *testing.T) {
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
