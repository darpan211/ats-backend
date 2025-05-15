import Joi from 'joi';

export const registerSchema = Joi.object({
    company_name: Joi.string().required(),
    owner_name: Joi.string().required(),
    email: Joi.string().email().required(),
    mobile: Joi.number().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('superadmin', 'seller', 'retailer').required(),
    metadata: Joi.object({
        gst: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
    }).required(),
    status: Joi.string().valid('active', 'inactive').required(),
    sellerId: Joi.string().optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});
