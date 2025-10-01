-- Parent Care Services Database Schema
CREATE DATABASE IF NOT EXISTS parent_care_services;
USE parent_care_services;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('parent', 'daughter', 'vendor') NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address TEXT,
  aadhar VARCHAR(14),
  voter_id VARCHAR(20),
  pan VARCHAR(10),
  photo_path VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_role (role)
);

-- Services Table
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('healthcare', 'cleaning', 'cooking', 'delivery', 'appointments', 'repairs', 'activities') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Services (Many-to-Many relationship for vendors)
CREATE TABLE user_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    price DECIMAL(10, 2),
    availability JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_service (user_id, service_id)
);

-- Client Details (Extended info for parents/clients)
CREATE TABLE client_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    client_history VARCHAR(255),
    mostAvailedService TEXT,
    emergency_contact JSON,
    care_preferences JSON,
    assigned_daughter_id TEXT,
    client_contactno VARCHAR(255),
    assigned_daughter_contactno VARCHAR(255),
    mobility_status ENUM('independent', 'assisted', 'wheelchair', 'bedridden') DEFAULT 'independent',
    dietary_restrictions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Family Relationships (For daughters/family members) - Not NEEDED only use ENUM on client tables emergency contact
-- CREATE TABLE family_relationships (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     daughter_id INT NOT NULL,
--     parent_id INT,
--     parent_name VARCHAR(255) NOT NULL,
--     relationship1 ENUM('daughter', 'son', 'daughter-in-law', 'son-in-law', 'other') NOT NULL,
--     relationship2 ENUM('daughter', 'son', 'daughter-in-law', 'son-in-law', 'other') NOT NULL,
--     relationship1_name VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
--     FOREIGN KEY (daughter_id) REFERENCES users(id) ON DELETE CASCADE,
--     FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
-- );

-- Vendor Details (Extended info for service providers)
CREATE TABLE vendor_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_registration VARCHAR(100),
    gst_number VARCHAR(15),
    service_description TEXT,
    years_experience INT,
    certifications JSON,
    service_areas JSON,
    ratings_average DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Service Requests
CREATE TABLE service_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    vendor_id INT,
    service_id INT NOT NULL,
    daughter_id INT,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    request_date DATE NOT NULL,
    request_time TIME,
    duration_hours INT,
    special_instructions TEXT,
    service_location VARCHAR(255),
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (daughter_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_client_id (client_id),
    INDEX idx_vendor_id (vendor_id),
    INDEX idx_status (status)
);

-- Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('service_request', 'appointment_reminder', 'payment', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read)
);

-- Callback Requests (from landing page)
CREATE TABLE callback_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    message TEXT,
    status ENUM('pending', 'contacted', 'converted', 'closed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP NULL,
    
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

-- Subscription detailse need to add