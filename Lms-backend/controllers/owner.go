package controllers

import (
	"fmt"
	"lms/backend/initializers"
	"lms/backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Library struct {
	ID   int
	Name string
}

func CreateLibrary(c *gin.Context) {
	//Find the user with this email
	emailId, _ := c.Get("email")
	fmt.Println(emailId)

	var userFound models.User
	//Check owner exists or not
	if err := initializers.DB.Where("email=?", emailId).Find(&userFound).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error": err.Error(),
		})
		return
	}

	//Check that one owner make one library only
	if userFound.LibID != 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"Message": "Already has a library",
		})
		return
	}

	//clib is creation of library
	var clib models.Library
	// fmt.Println(clib)
	if err := c.ShouldBindJSON(&clib); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"Error": err.Error(),
		})
		return
	}
	var existingLibrary models.Library

	initializers.DB.Where("name=?", clib.Name).Find(&existingLibrary)

	if existingLibrary.ID != 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error":   "Library with this name already exists",
			"Message": "Library with this name already exists",
		})
		return
	}

	nlibrary := models.Library{
		Name: clib.Name,
	}
	initializers.DB.Create(&nlibrary)

	if err := initializers.DB.Model(&models.User{}).Where("email=?", emailId).Update("LibID", nlibrary.ID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error":   err.Error(),
			"Message": "Couldnt update the id",
		})
	}
	// fmt.Println("user logged in ID", userFound.ID)
	// fmt.Println("New library ID", nlibrary.ID)

	c.JSON(http.StatusOK, gin.H{
		"data": nlibrary,
	})

}
func CreateAdmin(c *gin.Context) {
	// First check owner exists or not
	emailId, _ := c.Get("email")
	// fmt.Println(emailId)

	var userFound models.User

	//No need to check the role of the user as it has been taken care by the middleware only
	if err := initializers.DB.Where("email=? ", emailId).Find(&userFound).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error":   err.Error(),
			"Message": "Couldnt find the user with this email or user not found",
		})
		return
	}

	// If owner found then he is now trying to create the admin

	//Creation of admin
	var cadmin models.User

	// fmt.Println(cadmin)

	if err := c.ShouldBindJSON(&cadmin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error": err.Error(),
		})
		return
	}

	initializers.DB.Where("email=?", cadmin.Email).Find(&cadmin)

	if cadmin.ID != 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"Error":   "already exists with the same email",
			"Message": "already exists with the same email",
		})
		return
	}

	// if err := initializers.DB.Model(&models.User{}).Where("email=?", cadmin.Email).Find(&cadmin).Error; err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{
	// 		"Error":   err.Error(),
	// 		"Message": "user with this email already exists",
	// 	})
	// 	return
	// }

	newUser := models.User{
		Name:          cadmin.Name,
		Email:         cadmin.Email,
		ContactNumber: cadmin.ContactNumber,
		Role:          "admin",
		LibID:         userFound.LibID, //giving same id to admin as of the owner
	}
	initializers.DB.Create(&newUser)

	c.JSON(http.StatusOK, gin.H{
		"Message": "Admin created successfully",
		"Data":    newUser,
	})

}
func GetLib(c *gin.Context) {
	var libexist models.User
	// libraries := []models.Library{}
	email, _ := c.Get("email")

	//now check for its existence of Libid of this owner
	if err := initializers.DB.Where("email=?", email).First(&libexist).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"Message":"User not found",
			"Error": err.Error(),
		})
	}

	if libexist.LibID == 0 {
		//means lib doesnt exist
		c.JSON(http.StatusNotFound, gin.H{
			"Message": "Library doesnot exist",
		})
		return
	}
	var library models.Library

	if err := initializers.DB.Where("ID", libexist.LibID).First(&library).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Library not found",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"library": library,
	})
}
func GetAdmins(c *gin.Context) {
	//get owner (logged in id) from email and fetch the adminId library Id which will be equal to owner Id (library)
	email, _ := c.Get("email")
	var owner models.User

	if err := initializers.DB.Where("email=?", email).First(&owner).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error":   err.Error(),
			"Message": "Couldnt find logged in user",
		})
		return
	}

	var admins []models.User
	if err := initializers.DB.Where("lib_id=? AND role=?", owner.LibID, "admin").Not("lib_id=?", 0).Find(&admins).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"Error":   err.Error(),
			"Message": "Couldnot find the admins",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"admins": admins,
	})
}
