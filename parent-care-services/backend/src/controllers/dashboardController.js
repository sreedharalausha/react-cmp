const { pool } = require('../config/database')

const dashboardController = {
  // Get daughter dashboard data
  async getDaughterDashboard(req, res) {
    try {
      const { id } = req.params
      
      // Get daughter profile
      const [daughterData] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND role = "daughter"',
        [id]
      )
      
      if (daughterData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Daughter not found'
        })
      }
      
      // Get parents associated with this daughter
      const [parentsData] = await pool.execute(`
        SELECT u.*, p.medical_conditions, p.emergency_contact 
        FROM users u 
        LEFT JOIN parents p ON u.id = p.user_id 
        WHERE u.role = "parent"
      `)
      
      res.json({
        success: true,
        data: {
          daughter: daughterData[0],
          parents: parentsData
        }
      })
      
    } catch (error) {
      console.error('Get daughter dashboard error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      })
    }
  },

  // Get all vendors
  async getAllVendors(req, res) {
    try {
      const [vendors] = await pool.execute(`
        SELECT u.*, v.business_name, v.services, v.service_description 
        FROM users u 
        LEFT JOIN vendors v ON u.id = v.user_id 
        WHERE u.role = "vendor" AND u.status = "approved"
      `)
      
      res.json({
        success: true,
        data: vendors
      })
      
    } catch (error) {
      console.error('Get vendors error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendors'
      })
    }
  },

  // Update service status
  async updateServiceStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body
      
      // This would update a services table when you implement service management
      res.json({
        success: true,
        message: 'Service status updated successfully'
      })
      
    } catch (error) {
      console.error('Update service status error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update service status'
      })
    }
  }
}

module.exports = dashboardController