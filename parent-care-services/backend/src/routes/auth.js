// routes/auth.js
const express = require('express')
const { body } = require('express-validator')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const registrationController = require('../controllers/registrationController')

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = 'uploads'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Validation rules
const registrationValidation = [
  body('role').isIn(['parent', 'daughter', 'vendor']).withMessage('Invalid role'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('address').trim().isLength({ min: 10 }).withMessage('Address must be at least 10 characters'),
  body('aadhar').matches(/^\d{4}\s\d{4}\s\d{4}$/).withMessage('Invalid Aadhar format (XXXX XXXX XXXX)'),
  body('pan').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage('Invalid PAN format'),
  
  // Conditional validations based on role
  body('parent_name').if(body('role').equals('daughter')).notEmpty().withMessage('Parent name is required for daughter registration'),
  body('relationship').if(body('role').equals('daughter')).isIn(['daughter', 'son', 'daughter-in-law', 'son-in-law', 'other']).withMessage('Invalid relationship'),
]

// Routes
router.post('/register', upload.single('photo'), registrationValidation, registrationController.register)
// Add this route
router.post('/login', registrationController.login)

module.exports = router