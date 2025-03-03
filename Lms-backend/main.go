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
	// router.OPTIONS("/*path", func(c *gin.Context) {
	// 	c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
	// 	c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	// 	c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
	// 	c.Header("Access-Control-Allow-Credentials", "true")
	// 	c.Status(204)
	// })

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
			library.GET("/getAdmins",controllers.GetAdmins)
		}

		admin := protectedRoutes.Group("/admin")
		admin.Use(middleware.AdminOnly)
		{
			admin.POST("/add-book", controllers.AddBook)
			admin.DELETE("/:id", controllers.RemoveBook) // Only need to
			admin.PUT("/:id", controllers.UpdateBook)    // Only need to update with the id
			admin.GET("/list-requests", controllers.ListRequests)
			admin.PUT("/:id/approve", controllers.ApproveRequest) //function to approve or reject issue request
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
			reader.GET("/return-date/:id",controllers.GetReturnDate)
		}
	}
	router.Run(":8000")
}
