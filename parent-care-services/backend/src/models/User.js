const { pool } = require('../config/database')

class User {
  static async create(userData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const [userResult] = await connection.execute(
        `INSERT INTO users (role, name, phone, email, password, address, aadhar, voter_id, pan, photo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.role,
          userData.name,
          userData.phone,
          userData.address,
          userData.aadhar,
          userData.voter_id || null,
          userData.pan || null,
          userData.photo_path || null,
          userData.username,
          userData.password
        ]
      )
      
      const userId = userResult.insertId
      
      if (userData.role === 'parent') {
        await connection.execute(
          `INSERT INTO parents (user_id, medical_conditions, emergency_contact) VALUES (?, ?, ?)`,
          [userId, userData.medical_conditions || null, userData.emergency_contact || null]
        )
      } else if (userData.role === 'daughter') {
        await connection.execute(
          `INSERT INTO daughters (user_id, parent_name, relationship) VALUES (?, ?, ?)`,
          [userId, userData.parent_name, userData.relationship]
        )
      } else if (userData.role === 'vendor') {
        const services = Array.isArray(userData.services) ? userData.services : JSON.parse(userData.services || '[]')
        await connection.execute(
          `INSERT INTO vendors (user_id, business_name, services, service_description, gst_number) VALUES (?, ?, ?, ?, ?)`,
          [
            userId, 
            userData.business_name || userData.name,
            JSON.stringify(services),
            userData.service_description || null,
            userData.gst_number || null
          ]
        )
      }
      
      await connection.commit()
      return { id: userId, ...userData }
      
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
  
  static async findByCredentials(username, password, role) {
    const [rows] = await pool.execute(
      `SELECT u.*, 
              p.medical_conditions, p.emergency_contact,
              d.parent_name, d.relationship,
              v.business_name, v.services, v.service_description, v.gst_number, v.rating
       FROM users u
       LEFT JOIN parents p ON u.id = p.user_id
       LEFT JOIN daughters d ON u.id = d.user_id  
       LEFT JOIN vendors v ON u.id = v.user_id
       WHERE u.username = ? AND u.password = ? AND u.role = ?`,
      [username, password, role]
    )
    
    if (rows.length === 0) return null
    
    const user = rows[0]
    if (user.services) {
      user.services = JSON.parse(user.services)
    }
    
    return user
  }
  
  static async findByPhone(phone) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE phone = ?', [phone])
    return rows[0] || null
  }
  
  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC')
    return rows
  }
}

module.exports = User