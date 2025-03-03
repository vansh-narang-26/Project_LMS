package main

import (
	"lms/backend/controllers"
	"lms/backend/initializers"
	"lms/backend/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	initializers.ConnectDatabase()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	publicRoutes := router.Group("/api")
	{
		publicRoutes.POST("/users/register", controllers.CreateUser)
		publicRoutes.POST("/users/login", controllers.LoginUser)
		publicRoutes.GET("/getLib", controllers.GetLibraries)
	}

	protectedRoutes := router.Group("/api")
	protectedRoutes.Use(middleware.UserRetriveCookie)
	{
		library := protectedRoutes.Group("/library")
		library.Use(middleware.OwnerOnly)
		{
			library.POST("/create", controllers.CreateLibrary)
			library.POST("/create-admin", controllers.CreateAdmin)
			library.GET("/getlib", controllers.GetLib)
			library.GET("/getAdmins", controllers.GetAdmins)
		}

		admin := protectedRoutes.Group("/admin")
		admin.Use(middleware.AdminOnly)
		{
			admin.POST("/add-book", controllers.AddBook)
			admin.DELETE("/:id", controllers.RemoveBook)
			admin.PUT("/:id", controllers.UpdateBook)
			admin.GET("/list-requests", controllers.ListRequests)
			admin.PUT("/:id/approve", controllers.ApproveRequest)
			admin.PUT("/:id/reject", controllers.RejectRequest)
			admin.GET("/getBooks", controllers.GetAllBooks)
			admin.GET("/:id/issue-info", controllers.IssueInfo)
		}

		reader := protectedRoutes.Group("/reader")
		reader.Use(middleware.ReaderOnly)
		{
			reader.GET("/getBooks", controllers.GetAllBooks)
			reader.GET("/search-books", controllers.SearchBooks)
			reader.GET("/raise-request/:id", controllers.RaiseIssueRequest)
			reader.GET("/return-date/:id", controllers.GetReturnDate)
		}
	}

	router.Run(":8000")
}
