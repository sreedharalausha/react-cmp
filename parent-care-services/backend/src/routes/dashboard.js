const express = require('express')
const dashboardController = require('../controllers/dashboardController')

const router = express.Router()

// Daughter dashboard routes
router.get('/daughter/:id', dashboardController.getDaughterDashboard)
router.post('/daughter/:id/add-parent', dashboardController.addParent)
router.put('/service/:id/status', dashboardController.updateServiceStatus)

// Vendor management routes
router.get('/vendors', dashboardController.getAllVendors)
router.post('/vendors', dashboardController.addVendor)
router.get('/client-services', dashboardController.getClientServices)
router.put('/client-service/:id/status', dashboardController.updateClientServiceStatus)

module.exports = router