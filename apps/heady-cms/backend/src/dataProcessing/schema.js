import Joi from 'joi';
import auditLogger from '../audit/index.js';

export class DataProcessingSchema {
  constructor() {
    this.schemas = new Map();
    this.transformers = new Map();
    this.validators = new Map();
    this.initializeSchemas();
  }

  initializeSchemas() {
    this.registerSchema('user', {
      input: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        name: Joi.string().min(2).required(),
        role: Joi.string().valid('admin', 'editor', 'viewer').default('editor')
      }),
      output: Joi.object({
        id: Joi.string().required(),
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        role: Joi.string().required(),
        created_at: Joi.date().required()
      })
    });

    this.registerSchema('content_type', {
      input: Joi.object({
        name: Joi.string().pattern(/^[a-z0-9_]+$/).required(),
        display_name: Joi.string().required(),
        description: Joi.string().allow(''),
        schema: Joi.object({
          fields: Joi.array().items(
            Joi.object({
              name: Joi.string().required(),
              type: Joi.string().valid(
                'text', 'textarea', 'richtext', 'number', 
                'boolean', 'date', 'media', 'array', 'object'
              ).required(),
              required: Joi.boolean().default(false),
              unique: Joi.boolean().default(false),
              default: Joi.any(),
              validation: Joi.object()
            })
          ).min(1).required()
        }).required()
      }),
      output: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        display_name: Joi.string().required(),
        description: Joi.string(),
        schema: Joi.object().required(),
        created_at: Joi.date().required(),
        updated_at: Joi.date().required()
      })
    });

    this.registerSchema('content_entry', {
      input: Joi.object({
        data: Joi.object().required(),
        status: Joi.string().valid('draft', 'published', 'archived').default('draft')
      }),
      output: Joi.object({
        id: Joi.string().required(),
        content_type_id: Joi.string().required(),
        data: Joi.object().required(),
        status: Joi.string().required(),
        created_by: Joi.string().required(),
        created_at: Joi.date().required(),
        updated_at: Joi.date().required(),
        published_at: Joi.date().allow(null)
      })
    });

    this.registerSchema('media', {
      input: Joi.object({
        file: Joi.object().required(),
        resize: Joi.string().pattern(/^\d+x\d+$/)
      }),
      output: Joi.object({
        id: Joi.string().required(),
        filename: Joi.string().required(),
        original_name: Joi.string().required(),
        mime_type: Joi.string().required(),
        size: Joi.number().required(),
        url: Joi.string().required(),
        uploaded_by: Joi.string().required(),
        created_at: Joi.date().required()
      })
    });

    this.registerTransformer('user', {
      sanitize: (data) => {
        const { password, ...sanitized } = data;
        return sanitized;
      },
      normalize: (data) => ({
        ...data,
        email: data.email.toLowerCase().trim(),
        name: data.name.trim()
      })
    });

    this.registerTransformer('content_entry', {
      sanitize: (data) => {
        if (data.data && typeof data.data === 'object') {
          const sanitized = { ...data };
          Object.keys(sanitized.data).forEach(key => {
            if (typeof sanitized.data[key] === 'string') {
              sanitized.data[key] = sanitized.data[key].trim();
            }
          });
          return sanitized;
        }
        return data;
      },
      enrich: (data, context) => ({
        ...data,
        created_by: context.user?.userId,
        metadata: {
          created_via: 'api',
          ip_address: context.ip_address,
          user_agent: context.user_agent
        }
      })
    });

    console.log('📋 Data processing schemas initialized');
  }

  registerSchema(name, schema) {
    this.schemas.set(name, schema);
  }

  registerTransformer(name, transformer) {
    this.transformers.set(name, transformer);
  }

  registerValidator(name, validator) {
    this.validators.set(name, validator);
  }

  async validateInput(schemaName, data, context = {}) {
    const schema = this.schemas.get(schemaName);
    if (!schema || !schema.input) {
      throw new Error(`Schema not found: ${schemaName}`);
    }

    try {
      const { error, value } = schema.input.validate(data, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));

        auditLogger.logSystemEvent({
          event_type: 'validation_failed',
          component: 'data_processing',
          severity: 'warning',
          message: `Input validation failed for ${schemaName}`,
          details: { errors: details, data }
        });

        return { valid: false, errors: details };
      }

      return { valid: true, data: value };
    } catch (err) {
      auditLogger.logSystemEvent({
        event_type: 'validation_error',
        component: 'data_processing',
        severity: 'error',
        message: `Validation error for ${schemaName}`,
        details: { error: err.message },
        stack_trace: err.stack
      });

      throw err;
    }
  }

  async validateOutput(schemaName, data) {
    const schema = this.schemas.get(schemaName);
    if (!schema || !schema.output) {
      return { valid: true, data };
    }

    try {
      const { error, value } = schema.output.validate(data, {
        abortEarly: false
      });

      if (error) {
        auditLogger.logSystemEvent({
          event_type: 'output_validation_failed',
          component: 'data_processing',
          severity: 'error',
          message: `Output validation failed for ${schemaName}`,
          details: { errors: error.details }
        });

        return { valid: false, errors: error.details };
      }

      return { valid: true, data: value };
    } catch (err) {
      throw err;
    }
  }

  async transform(schemaName, data, operation, context = {}) {
    const transformer = this.transformers.get(schemaName);
    if (!transformer) {
      return data;
    }

    let transformed = { ...data };

    if (operation === 'input' || operation === 'all') {
      if (transformer.normalize) {
        transformed = transformer.normalize(transformed, context);
      }
      if (transformer.enrich) {
        transformed = transformer.enrich(transformed, context);
      }
    }

    if (operation === 'output' || operation === 'all') {
      if (transformer.sanitize) {
        transformed = transformer.sanitize(transformed, context);
      }
    }

    return transformed;
  }

  async process(schemaName, data, context = {}) {
    const startTime = Date.now();

    try {
      let processed = data;

      processed = await this.transform(schemaName, processed, 'input', context);

      const validation = await this.validateInput(schemaName, processed, context);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          processingTime: Date.now() - startTime
        };
      }

      processed = validation.data;

      const customValidator = this.validators.get(schemaName);
      if (customValidator) {
        const customValidation = await customValidator(processed, context);
        if (!customValidation.valid) {
          return {
            success: false,
            errors: customValidation.errors,
            processingTime: Date.now() - startTime
          };
        }
      }

      auditLogger.log({
        action: 'data_processed',
        resource_type: schemaName,
        metadata: {
          processing_time_ms: Date.now() - startTime,
          fields_processed: Object.keys(processed).length
        },
        severity: 'info'
      });

      return {
        success: true,
        data: processed,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      auditLogger.logSystemEvent({
        event_type: 'processing_error',
        component: 'data_processing',
        severity: 'error',
        message: `Error processing ${schemaName}`,
        details: { error: error.message, data },
        stack_trace: error.stack
      });

      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  async validateContentAgainstSchema(contentTypeSchema, data) {
    const errors = [];

    for (const field of contentTypeSchema.fields) {
      const value = data[field.name];

      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.name,
          message: `${field.name} is required`,
          type: 'required'
        });
        continue;
      }

      if (value !== undefined && value !== null) {
        const typeValidation = this.validateFieldType(field.type, value, field.name);
        if (!typeValidation.valid) {
          errors.push(typeValidation.error);
        }
      }

      if (field.validation) {
        const customValidation = this.applyCustomValidation(field.validation, value, field.name);
        if (!customValidation.valid) {
          errors.push(customValidation.error);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateFieldType(type, value, fieldName) {
    const validators = {
      text: (v) => typeof v === 'string',
      textarea: (v) => typeof v === 'string',
      richtext: (v) => typeof v === 'string',
      number: (v) => typeof v === 'number' && !isNaN(v),
      boolean: (v) => typeof v === 'boolean',
      date: (v) => !isNaN(Date.parse(v)),
      media: (v) => typeof v === 'string',
      array: (v) => Array.isArray(v),
      object: (v) => typeof v === 'object' && v !== null && !Array.isArray(v)
    };

    const validator = validators[type];
    if (!validator) {
      return { valid: false, error: { field: fieldName, message: `Unknown field type: ${type}`, type: 'type' } };
    }

    if (!validator(value)) {
      return { valid: false, error: { field: fieldName, message: `Invalid type for ${fieldName}, expected ${type}`, type: 'type' } };
    }

    return { valid: true };
  }

  applyCustomValidation(validation, value, fieldName) {
    if (validation.min !== undefined && value < validation.min) {
      return { valid: false, error: { field: fieldName, message: `${fieldName} must be at least ${validation.min}`, type: 'min' } };
    }

    if (validation.max !== undefined && value > validation.max) {
      return { valid: false, error: { field: fieldName, message: `${fieldName} must be at most ${validation.max}`, type: 'max' } };
    }

    if (validation.minLength !== undefined && value.length < validation.minLength) {
      return { valid: false, error: { field: fieldName, message: `${fieldName} must be at least ${validation.minLength} characters`, type: 'minLength' } };
    }

    if (validation.maxLength !== undefined && value.length > validation.maxLength) {
      return { valid: false, error: { field: fieldName, message: `${fieldName} must be at most ${validation.maxLength} characters`, type: 'maxLength' } };
    }

    if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
      return { valid: false, error: { field: fieldName, message: `${fieldName} does not match required pattern`, type: 'pattern' } };
    }

    return { valid: true };
  }

  getSchema(name) {
    return this.schemas.get(name);
  }

  listSchemas() {
    return Array.from(this.schemas.keys());
  }
}

export default new DataProcessingSchema();
