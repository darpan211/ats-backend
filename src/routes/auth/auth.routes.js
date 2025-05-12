import express from 'express';
import { login, register } from '../../controllers/auth/authController.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
    loginSchema,
    registerSchema,
} from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);

export default router;
