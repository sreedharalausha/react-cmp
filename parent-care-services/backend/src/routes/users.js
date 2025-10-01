const express = require('express')
const registrationController = require('../controllers/registrationController')

const router = express.Router()

// Get all registrations
router.get('/registrations', registrationController.getAllRegistrations)

// // Get single registration
// router.get('/registrations/:id', registrationController.getRegistration)

// // Update registration status
// router.patch('/registrations/:id/status', registrationController.updateStatus)

// Get daughter with associated parents
router.get('/daughter/:id', async (req, res) => {
    try {
      const { id } = req.params
      const daughter = await User.findById(id)
      res.json({ success: true, data: daughter })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  })
  
  // Get parents associated with daughter
  router.get('/daughter/:id/parents', async (req, res) => {
    try {
      const { id } = req.params
      const [rows] = await pool.execute(`
        SELECT u.*, 'Home Care Services' as active_service 
        FROM users u 
        JOIN parent_daughter_relationships pdr ON u.id = pdr.parent_id 
        WHERE pdr.daughter_id = ? AND u.role = 'parent'
      `, [id])
      res.json({ success: true, data: rows })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  })
  
  // Get active services for daughter
  router.get('/daughter/:id/services', async (req, res) => {
    try {
      const { id } = req.params
      const [rows] = await pool.execute(`
        SELECT sa.*, u1.name as client_name, u1.phone as client_contact, 
               u2.name as vendor_name, u2.phone as vendor_contact
        FROM service_assignments sa
        JOIN users u1 ON sa.client_id = u1.id
        LEFT JOIN users u2 ON sa.vendor_id = u2.id
        WHERE sa.daughter_id = ?
      `, [id])
      res.json({ success: true, data: rows })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  })
  
  // Get all vendors
  router.get('/vendors', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT u.*, v.services, v.business_name
        FROM users u
        JOIN vendors v ON u.id = v.user_id
        WHERE u.role = 'vendor'
      `)
      res.json({ success: true, data: rows })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  })
  
  // Get clients with services
  router.get('/clients-with-services', async (req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT u.*, 'Home Care Services' as active_service,
               d.name as daughter_name, d.id as daughter_id,
               'Compassionate Care Partners' as vendor_name,
               '+1-555-CARE-001' as vendor_contact,
               'active' as status
        FROM users u
        LEFT JOIN daughters dt ON u.id = dt.user_id
        LEFT JOIN users d ON dt.user_id = d.id
        WHERE u.role = 'parent'
      `)
      res.json({ success: true, data: rows })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  })

module.exports = router