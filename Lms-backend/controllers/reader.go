package controllers

import (
	"fmt"
	"lms/backend/initializers"
	"lms/backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func SearchBooks(c *gin.Context) {
	// var book models.BookInventory
	adminID, _ := c.Get("id")

	var findUser models.User

	if err := initializers.DB.Where("ID=?", adminID).Find(&findUser).Error; err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"Message": "Couldnt find the user",
			"Error":   err.Error(),
		})
		return
	}
	fmt.Println("Library id", findUser.LibID)

	var books []models.BookInventory //will store all the books in the array
	query := c.Query("q")
	if err := initializers.DB.Where("lib_id=? AND (title LIKE ? OR authors LIKE ? OR publisher LIKE ?)", findUser.LibID, "%"+query+"%", "%"+query+"%", "%"+query+"%").Find(&books).Error; err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"Error":   err.Error(),
			"Message": "No book found",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"Books": books,
	})

}

func RaiseIssueRequest(c *gin.Context) {
	//userId, exists := c.Get("id")
	// if !exists {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
	// 	return
	// }
	isbn := c.Param("id")
	email, _ := c.Get("email")
	// fmt.Println("Book id ", isbn)
	// fmt.Println("Email id", email)

	//finding the id for the person who has logged in
	var user models.User
	if err := initializers.DB.Where("email = ? AND role = ?", email, "reader").First(&user).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "User not required"})
		return
	}

	var book models.BookInventory
	//Find the book with this above id
	if err := initializers.DB.Where("isbn=?", isbn).Find(&book).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error":   err.Error(),
			"Message": "Book not with this isbn",
		})
	}

	//If book not available the request must get rejected
	if book.AvailableCopies <= 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"Message": "Book is not available you request has been denied",
		})
		return
	}
	var request models.RequestEvent //Checking already request in the request events
	if err := initializers.DB.Where("book_id=? AND request_type=? AND reader_id=?", book.ISBN, "Requested", user.ID).Find(&request).Error; err != nil {
		//means it got found so err would be nil
		c.JSON(http.StatusBadGateway, gin.H{
			"Error": err.Error(),
		})
		return
	}

	if request.ReaderID == user.ID {
		c.JSON(http.StatusBadRequest, gin.H{
			"Message": "The book has been already requested by you",
		})
		return
	}

	// t:=time.Now
	crequest := models.RequestEvent{
		BookID:      isbn,
		ReaderID:    user.ID,
		RequestDate: time.Now(),
		RequestType: "Requested",
	}
	initializers.DB.Create(&crequest)

	c.JSON(http.StatusCreated, gin.H{
		"Message": "Request created successfully",
		"Request": crequest,
		"Email":   email,
	})
}

func GetLibraries(c *gin.Context) {
	var library []models.Library

	if err := initializers.DB.Find(&library).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"libraries": library,
	})
}

func GetReturnDate(c *gin.Context) {
	var book models.IssueRegistry
	id := c.Param("id")

	if err := initializers.DB.Where("isbn=? AND issue_status=?", id, "Issued").Find(&book).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error":   err.Error(),
			"Message": "Couldnt find book with this isbn",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"return_date": book.ExpectedReturnDate,
	})
}