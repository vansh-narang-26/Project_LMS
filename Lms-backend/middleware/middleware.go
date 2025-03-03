package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

var nrole string

func UserRetriveCookie(c *gin.Context) {

	// valid := ValidateCookie(c)
	// if valid == false {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "User not logged in"})
	// 	c.Abort()
	// } else {

	// userId, role, email, err := RetriveJwtToken(c)
	// if err != nil {
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
	// 	c.Abort()
	// } else {
	// 	c.Set("id", userId)
	// 	c.Set("email", email)
	// }
	// nrole = role

	userId, role, email, err := ExtractTokenID(c)
	// fmt.Println("User id", userId)
	// fmt.Println(userId, role, email, err)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		c.Abort()
	} else {
		c.Set("id", userId)
		c.Set("email", email)
	}
	nrole = role
	// if role != "owner" {
	// 	//fmt.Println(role)
	// 	c.JSON(http.StatusUnauthorized, gin.H{"error": "Only owner can create the library"})
	// 	c.Abort()
	// }
	// }
	c.Next()
}
func OwnerOnly(c *gin.Context) {
	if nrole != "owner" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Only owner has the access to do so"})
		c.Abort()
		return
	}
	c.Next()
}
func AdminOnly(c *gin.Context) {
	if nrole != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Only admin has the access to do so"})
		c.Abort()
		return
	}
	c.Next()
}
func ReaderOnly(c *gin.Context) {
	if nrole != "reader" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Only reader has the access to do so",
		})
		c.Abort()
		return
	}
	c.Next()
}

// func RetriveJwtToken(c *gin.Context) (int, string, string, error) {
// 	cookie, err := c.Cookie("Authorise")
// 	fmt.Println("Cookie not found bro")
// 	if err != nil {
// 		return 0, "", "", errors.New("cookie not found")
// 	}

// 	// fmt.Println("Cookie:", cookie)
// 	token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
// 		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return nil, fmt.Errorf("invalid signing method")
// 		}
// 		return []byte("SECRET"), nil
// 	})

// 	if err != nil {
// 		fmt.Println("Token parse error:", err)
// 		return 0, "", "", err
// 	}

//		fmt.Println("Hello", token)
//		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
//			userId, okId := claims["id"].(float64)
//			role, okRole := claims["role"].(string)
//			email, okEmail := claims["email"].(string)
//			// fmt.Println("Email", email)
//			if !okId || !okRole || !okEmail {
//				return 0, "", "", fmt.Errorf("invalid claims")
//			}
//			return int(userId), role, email, nil
//		} else {
//			return 0, "", "", fmt.Errorf("invalid token")
//		}
//	}
func ExtractToken(c *gin.Context) string {
	// token := c.Query("token")
	// if token != "" {
	// 	return token
	// }
	bearerToken := c.Request.Header.Get("Authorization")
	//fmt.Println("Bearer", bearerToken)
	if len(strings.Split(bearerToken, " ")) == 2 {
		return strings.Split(bearerToken, " ")[1]
	}
	return ""
}

func ExtractTokenID(c *gin.Context) (int, string, string, error) {

	tokenString := ExtractToken(c)
	//fmt.Println("token", tokenString)
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte("SECRET"), nil
	})
	if err != nil {
		return 0, "", "", err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userId, okId := claims["id"].(float64)
		role, okRole := claims["role"].(string)
		email, okEmail := claims["email"].(string)
		fmt.Println("Email", email)
		if !okId || !okRole || !okEmail {
			return 0, "", "", fmt.Errorf("invalid claims")
		}
		return int(userId), role, email, nil
	} else {
		return 0, "", "", fmt.Errorf("invalid token")
	}
}

// func ValidateCookie(c *gin.Context) bool {
// 	cookie, _ := c.Cookie("Authorise")
// 	//	fmt.Println("Col", cookie)
// 	if cookie == "" {
// 		fmt.Println("cookie not found")
// 		return false
// 	} else {
// 		return true
// 	}

// }
