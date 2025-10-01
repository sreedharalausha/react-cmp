const Joi = require('joi');

const validateRegistration = {
  parent: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      password: Joi.string().min(6).required(),
      address: Joi.string().min(10).required(),
      aadhar_number: Joi.string().pattern(/^\d{4}\s\d{4}\s\d{4}$/).required(),
      voter_id: Joi.string().max(20).allow(''),
      pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).allow(''),
      medical_conditions: Joi.string().allow(''),
      emergency_contact: Joi.string().allow('')
    });
    return schema.validate(data);
  },

  daughter: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      password: Joi.string().min(6).required(),
      address: Joi.string().min(10).required(),
      aadhar_number: Joi.string().pattern(/^\d{4}\s\d{4}\s\d{4}$/).required(),
      voter_id: Joi.string().max(20).allow(''),
      pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
      parent_name: Joi.string().min(2).max(255).required(),
      relationship: Joi.string().valid('daughter', 'son', 'daughter-in-law', 'son-in-law', 'other').required()
    });
    return schema.validate(data);
  },

  vendor: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
      password: Joi.string().min(6).required(),
      address: Joi.string().min(10).required(),
      aadhar_number: Joi.string().pattern(/^\d{4}\s\d{4}\s\d{4}$/).required(),
      voter_id: Joi.string().max(20).allow(''),
      pan_number: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required(),
      business_name: Joi.string().min(2).max(255).required(),
      gst_number: Joi.string().max(15).allow(''),
      service_description: Joi.string().allow(''),
      services: Joi.array().items(Joi.string().valid('healthcare', 'cleaning', 'cooking', 'delivery', 'appointments', 'repairs', 'activities')).min(1).required()
    });
    return schema.validate(data);
  }
};

module.exports = { validateRegistration };