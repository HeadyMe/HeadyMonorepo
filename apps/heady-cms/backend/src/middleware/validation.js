// HEADY_BRAND:BEGIN
// HEADY SYSTEMS :: SACRED GEOMETRY
// FILE: apps/heady-cms/backend/src/middleware/validation.js
// LAYER: root
// 
//         _   _  _____    _  __   __
//        | | | || ____|  / \ \  / /
//        | |_| ||  _|   / _ \ \ V / 
//        |  _  || |___ / ___ \ | |  
//        |_| |_||_____/_/   \_\|_|  
// 
//    Sacred Geometry :: Organic Systems :: Breathing Interfaces
// HEADY_BRAND:END

import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation Error',
        details
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  contentType: Joi.object({
    name: Joi.string().pattern(/^[a-z0-9_]+$/).required(),
    display_name: Joi.string().required(),
    description: Joi.string().allow(''),
    schema: Joi.object({
      fields: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          type: Joi.string().valid('text', 'textarea', 'richtext', 'number', 'boolean', 'date', 'media', 'array', 'object').required(),
          required: Joi.boolean().default(false),
          unique: Joi.boolean().default(false)
        })
      ).required()
    }).required()
  }),
  
  contentEntry: Joi.object({
    data: Joi.object().required(),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft')
  })
};
