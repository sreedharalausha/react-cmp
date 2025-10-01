const mysql = require('mysql2/promise')

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'parent_care',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

const pool = mysql.createPool(dbConfig)

const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Connected to MySQL successfully')
    
    // Create tables directly (database already exists from manual creation)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role ENUM('parent', 'daughter', 'vendor') NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        aadhar VARCHAR(14) NOT NULL,
        voter_id VARCHAR(50),
        pan VARCHAR(10),
        photo_path VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS parents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        medical_conditions TEXT,
        emergency_contact VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daughters (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        parent_name VARCHAR(255) NOT NULL,
        relationship ENUM('daughter', 'son', 'daughter-in-law', 'son-in-law', 'other') NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    // Add this to your table creation SQL
await connection.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('parent', 'daughter', 'vendor') NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    aadhar VARCHAR(14) NOT NULL,
    voter_id VARCHAR(50),
    pan VARCHAR(10),
    photo_path VARCHAR(255),
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`)

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vendors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        business_name VARCHAR(255),
        services JSON,
        service_description TEXT,
        gst_number VARCHAR(15),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    connection.release()
    console.log('Database tables initialized successfully')
    
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

initializeDatabase()

module.exports = { pool }