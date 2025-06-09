import Joi from 'joi';

export const registerSchema = Joi.object({
    company_name: Joi.string().required(),
    owner_name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.number().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'superadmin', 'seller').required(),
    seller_type: Joi.string()
        .valid('retailer', 'distributer', 'supplier')
        .required(),
    metadata: Joi.object({
        gst: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
    }).required(),
    status: Joi.string().valid('active', 'inactive').required(),
    sellerId: Joi.string().optional(),
});

export const updateSchema = Joi.object({
    company_name: Joi.string(),
    owner_name: Joi.string(),
    email: Joi.string().email(),
    mobile: Joi.number(),
    password: Joi.string().min(8),
    role: Joi.string().valid('admin', 'superadmin', 'seller'),
    seller_type: Joi.string().valid('retailer', 'distributer', 'supplier'),
    metadata: Joi.object({
        gst: Joi.string(),
        address: Joi.string(),
        city: Joi.string(),
    }),
    status: Joi.string().valid('active', 'inactive'),
    sellerId: Joi.string().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});
