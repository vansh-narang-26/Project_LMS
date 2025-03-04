package controllers

import (
	"bytes"
	"encoding/json"
	"lms/backend/initializers"
	"lms/backend/middleware"
	"lms/backend/models"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func IntialiseRoutes(router *gin.Engine) *gin.Engine {

	publicRoutes := router.Group("/api")
	{
		publicRoutes.POST("/users/register", CreateUser)
		publicRoutes.POST("/users/login", LoginUser)
		publicRoutes.GET("/getLib", GetLibraries)
	}

	protectedRoutes := router.Group("/api")
	protectedRoutes.Use(middleware.UserRetriveCookie)
	{
		library := protectedRoutes.Group("/library")
		library.Use(middleware.OwnerOnly)
		{
			library.POST("/create", CreateLibrary)
			library.POST("/create-admin", CreateAdmin)
			library.GET("/getlib", GetLib)
			library.GET("/getAdmins", GetAdmins)
		}

		admin := protectedRoutes.Group("/admin")
		admin.Use(middleware.AdminOnly)
		{
			admin.POST("/add-book", AddBook)
			admin.DELETE("/:id", RemoveBook)
			admin.PUT("/:id", UpdateBook)
			admin.GET("/list-requests", ListRequests)
			admin.PUT("/:id/approve", ApproveRequest)
			admin.PUT("/:id/reject", RejectRequest)
			admin.GET("/getBooks", GetAllBooks)
			admin.GET("/:id/issue-info", IssueInfo)
		}

		reader := protectedRoutes.Group("/reader")
		reader.Use(middleware.ReaderOnly)
		{
			reader.GET("/getBooks", GetAllBooks)
			reader.GET("/search-books", SearchBooks)
			reader.GET("/raise-request/:id", RaiseIssueRequest)
			reader.GET("/return-date/:id", GetReturnDate)
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
	//initializers.DB.Exec("DELETE FROM book_inventories")
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
		// {
		// 	name:       "Successfully Adding a New Book",
		// 	payload:    `{"isbn":"1", "title":"New Book", "authors":"New Author", "publisher":"New Publisher", "version":1}`,
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

			//	log.Println("Response", response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

func TestRemoveBook(t *testing.T) {
	setupTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)
	tests := []struct {
		name       string
		bookID     string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		{
			name:       "User doesnt exist",
			bookID:     "1",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "Only admin has the access to do so",
		},
		{
			name:       "Unauthorized Access",
			bookID:     "1",
			headers:    map[string]string{},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "token contains an invalid number of segments",
		},
		{
			name:       "Book Not Found",
			bookID:     "999",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
			wantStatus: http.StatusNotFound,
			wantKey:    "error",
			wantMsg:    "Book not found.",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("DELETE", "/api/admin/"+tt.bookID, nil)
			req.Header.Set("Content-Type", "application/json")
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			//	log.Println("Response", response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

func TestUpdateBook(t *testing.T) {
	setupTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)

	tests := []struct {
		name       string
		bookID     string
		payload    string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		// {
		// 	name:       "Unauthorized Access",
		// 	bookID:     "1",
		// 	payload:    `{"title":"Updated Title", "authors":"Updated Author", "publisher":"Updated Publisher", "version":2}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
		// 	wantStatus: http.StatusUnauthorized,
		// 	wantKey:    "Error",
		// 	wantMsg:    "Only admin has the access to do so",
		// },
		{
			name:       "Book Not Found",
			bookID:     "999",
			payload:    `{"title":"Updated Title", "authors":"Updated Author", "publisher":"Updated Publisher", "version":2}`,
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
			wantStatus: http.StatusNotFound,
			wantKey:    "error",
			wantMsg:    "Book not found.",
		},
		// {
		// 	name:       "Successfully Updating a Book",
		// 	bookID:     "1",
		// 	payload:    `{"title":"Updated Title", "authors":"Updated Author", "publisher":"Updated Publisher", "version":2}`,
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "title",
		// 	wantMsg:    "Updated Title",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("PUT", "/api/admin/"+tt.bookID, bytes.NewBuffer([]byte(tt.payload)))
			req.Header.Set("Content-Type", "application/json")
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

// func TestListRequests(t *testing.T) {
// 	setupTestDB()

// 	gin.SetMode(gin.TestMode)
// 	router := gin.Default()
// 	IntialiseRoutes(router)

// 	tests := []struct {
// 		name       string
// 		headers    map[string]string
// 		wantStatus int
// 		wantKey    string
// 		wantMsg    string
// 	}{
// 		{
// 			name:       "Unauthorized Access",
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
// 			wantStatus: http.StatusUnauthorized,
// 			wantKey:    "error",
// 			wantMsg:    "Only admin has the access to do so",
// 		},
// 		{
// 			name:       "Successfully Listing Requests",
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusOK,
// 			wantKey:    "message",
// 			wantMsg:    "[]interface{}([]interface{}{})",
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			w := httptest.NewRecorder()
// 			req, _ := http.NewRequest("GET", "/api/admin/list-requests", nil)
// 			req.Header.Set("Content-Type", "application/json")
// 			for key, value := range tt.headers {
// 				req.Header.Set(key, value)
// 			}

// 			router.ServeHTTP(w, req)

// 			assert.Equal(t, tt.wantStatus, w.Code)

// 			var response map[string]interface{}
// 			json.Unmarshal(w.Body.Bytes(), &response)

// 			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
// 		})
// 	}
// }

// func TestApproveRequest(t *testing.T) {
// 	setupTestDB()

// 	gin.SetMode(gin.TestMode)
// 	router := gin.Default()
// 	IntialiseRoutes(router)

// 	tests := []struct {
// 		name       string
// 		requestID  string
// 		payload    string
// 		headers    map[string]string
// 		wantStatus int
// 		wantKey    string
// 		wantMsg    string
// 	}{
// 		{
// 			name:       "Unauthorized Access",
// 			requestID:  "1",
// 			payload:    `{"request_type":"Issued"}`,
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
// 			wantStatus: http.StatusForbidden,
// 			wantKey:    "error",
// 			wantMsg:    "Admin access required",
// 		},
// 		{
// 			name:       "Request Not Found",
// 			requestID:  "999",
// 			payload:    `{"request_type":"Issued"}`,
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusBadRequest,
// 			wantKey:    "Message",
// 			wantMsg:    "Couldnot find the request with this id",
// 		},
// 		{
// 			name:       "Successfully Approving a Request",
// 			requestID:  "1",
// 			payload:    `{"request_type":"Issued"}`,
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusAccepted,
// 			wantKey:    "message",
// 			wantMsg:    "updation successfully done",
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			w := httptest.NewRecorder()
// 			req, _ := http.NewRequest("PUT", "/api/admin/"+tt.requestID+"/approve", bytes.NewBuffer([]byte(tt.payload)))
// 			req.Header.Set("Content-Type", "application/json")
// 			for key, value := range tt.headers {
// 				req.Header.Set(key, value)
// 			}

// 			router.ServeHTTP(w, req)

// 			assert.Equal(t, tt.wantStatus, w.Code)

// 			var response map[string]interface{}
// 			json.Unmarshal(w.Body.Bytes(), &response)

// 			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
// 		})
// 	}
// }

// func TestRejectRequest(t *testing.T) {
// 	setupTestDB()

// 	gin.SetMode(gin.TestMode)
// 	router := gin.Default()
// 	IntialiseRoutes(router)

// 	tests := []struct {
// 		name       string
// 		requestID  string
// 		payload    string
// 		headers    map[string]string
// 		wantStatus int
// 		wantKey    string
// 		wantMsg    string
// 	}{
// 		{
// 			name:       "Unauthorized Access",
// 			requestID:  "1",
// 			payload:    `{"request_type":"Rejected"}`,
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
// 			wantStatus: http.StatusForbidden,
// 			wantKey:    "error",
// 			wantMsg:    "Only admin has the access to do so",
// 		},
// 		{
// 			name:       "Request Not Found",
// 			requestID:  "999",
// 			payload:    `{"request_type":"Rejected"}`,
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusBadRequest,
// 			wantKey:    "Message",
// 			wantMsg:    "Couldnot find the request with this id",
// 		},
// 		{
// 			name:       "Successfully Rejecting a Request",
// 			requestID:  "1",
// 			payload:    `{"request_type":"Rejected"}`,
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusAccepted,
// 			wantKey:    "message",
// 			wantMsg:    "updation successfully done",
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			w := httptest.NewRecorder()
// 			req, _ := http.NewRequest("PUT", "/api/admin/"+tt.requestID+"/reject", bytes.NewBuffer([]byte(tt.payload)))
// 			req.Header.Set("Content-Type", "application/json")
// 			for key, value := range tt.headers {
// 				req.Header.Set(key, value)
// 			}

// 			router.ServeHTTP(w, req)

// 			assert.Equal(t, tt.wantStatus, w.Code)

// 			var response map[string]interface{}
// 			json.Unmarshal(w.Body.Bytes(), &response)

// 			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
// 		})
// 	}
// }

func TestGetAllBooks(t *testing.T) {
	setupTestDB()

	gin.SetMode(gin.TestMode)
	router := gin.Default()
	IntialiseRoutes(router)

	tests := []struct {
		name       string
		headers    map[string]string
		wantStatus int
		wantKey    string
		wantMsg    string
	}{
		{
			name:       "Unauthorized Access",
			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
			wantStatus: http.StatusUnauthorized,
			wantKey:    "error",
			wantMsg:    "Only admin has the access to do so",
		},
		// {
		// 	name:       "Successfully Getting All Books",
		// 	headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
		// 	wantStatus: http.StatusOK,
		// 	wantKey:    "Books",
		// 	wantMsg:    "[]",
		// },
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/api/admin/getBooks", nil)
			req.Header.Set("Content-Type", "application/json")
			for key, value := range tt.headers {
				req.Header.Set(key, value)
			}

			router.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatus, w.Code)

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
		})
	}
}

// func TestIssueInfo(t *testing.T) {
// 	setupTestDB()

// 	gin.SetMode(gin.TestMode)
// 	router := gin.Default()
// 	IntialiseRoutes(router)

// 	tests := []struct {
// 		name       string
// 		readerID   string
// 		headers    map[string]string
// 		wantStatus int
// 		wantKey    string
// 		wantMsg    string
// 	}{
// 		{
// 			name:       "Unauthorized Access",
// 			readerID:   "1",
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9AZ21haWwuY29tIiwiaWQiOjcsInJvbGUiOiJvd25lciJ9.qdKesVazsIAgF8cKLv2PKNPlSkxH-o31HbVyMm4iQNY"},
// 			wantStatus: http.StatusUnauthorized,
// 			wantKey:    "error",
// 			wantMsg:    "Unauthorized",
// 		},
// 		{
// 			name:       "Reader Not Found",
// 			readerID:   "999",
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusAccepted,
// 			wantKey:    "Error",
// 			wantMsg:    "Coulnt find any issue registry",
// 		},
// 		{
// 			name:       "Successfully Getting Issue Info",
// 			readerID:   "1",
// 			headers:    map[string]string{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9hQGdtYWlsLmNvbSIsImlkIjozLCJyb2xlIjoiYWRtaW4ifQ.ru4Pd-PbrERi4kA3HsAnjc-qgyx22SU0QcK_a_mydHM"},
// 			wantStatus: http.StatusFound,
// 			wantKey:    "info",
// 			wantMsg:    "[]",
// 		},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			w := httptest.NewRecorder()
// 			req, _ := http.NewRequest("GET", "/api/admin/"+tt.readerID+"issue-info", nil)
// 			req.Header.Set("Content-Type", "application/json")
// 			for key, value := range tt.headers {
// 				req.Header.Set(key, value)
// 			}

// 			router.ServeHTTP(w, req)

// 			assert.Equal(t, tt.wantStatus, w.Code)

// 			var response map[string]interface{}
// 			json.Unmarshal(w.Body.Bytes(), &response)

// 			assert.Equal(t, tt.wantMsg, response[tt.wantKey])
// 		})
// 	}
// }
