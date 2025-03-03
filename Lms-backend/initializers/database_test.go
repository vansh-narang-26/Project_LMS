package initializers

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func ConnectTestDatabase() {
	var err error
	DB, err = gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}
}
