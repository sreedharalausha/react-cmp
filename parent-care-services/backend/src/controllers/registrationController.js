const User = require('../models/User')
const { validationResult } = require('express-validator')

// Function to generate username and password
const generateCredentials = (name, phone) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '').slice(0, 6)
  const phoneLastFour = phone.slice(-4)
  const username = `${cleanName}${phoneLastFour}`
  
  // Generate random password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return { username, password }
}

const registrationController = {
  async register(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        })
      }

      const userData = req.body
      
      if (req.file) {
        userData.photo_path = req.file.path
      }

      const existingUser = await User.findByPhone(userData.phone)
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        })
      }

      // Generate credentials
      const credentials = generateCredentials(userData.name, userData.phone)
      userData.username = credentials.username
      userData.password = credentials.password // In production, hash this password

      const newUser = await User.create(userData)
      
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please save your login credentials.',
        data: {
          id: newUser.id,
          role: newUser.role,
          name: newUser.name,
          status: 'pending'
        },
        credentials: {
          username: credentials.username,
          password: credentials.password
        }
      })

    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  },

  // Login endpoint
  async login(req, res) {
    try {
      const { username, password, role } = req.body

      if (!username || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, and role are required'
        })
      }

      const user = await User.findByCredentials(username, password, role)
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        })
      }

      if (user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval. Please wait for admin verification.'
        })
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          phone: user.phone,
          status: user.status
        }
      })

    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      })
    }
  },

  // Rest of your existing methods...
  async getAllRegistrations(req, res) {
    try {
      const { role, status, limit } = req.query
      const filters = {}
      
      if (role) filters.role = role
      if (status) filters.status = status  
      if (limit) filters.limit = limit

      const users = await User.findAll(filters)
      
      res.json({
        success: true,
        data: users,
        count: users.length
      })

    } catch (error) {
      console.error('Get registrations error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations'
      })
    }
  }
}

module.exports = registrationController