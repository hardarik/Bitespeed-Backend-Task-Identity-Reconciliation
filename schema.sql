CREATE DATABASE IF NOT EXISTS bitespeed_identity
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bitespeed_identity;

CREATE TABLE IF NOT EXISTS Contacts (
  id INT NOT NULL AUTO_INCREMENT,
  phoneNumber VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  linkedId INT NULL,
  linkPrecedence ENUM('primary', 'secondary') NOT NULL DEFAULT 'primary',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_email (email),
  INDEX idx_phoneNumber (phoneNumber),
  INDEX idx_linkedId (linkedId),
  CONSTRAINT fk_linkedId FOREIGN KEY (linkedId) REFERENCES Contacts (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
