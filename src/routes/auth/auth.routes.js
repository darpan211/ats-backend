import express from 'express';
import {
    deleteUser,
    getUsers,
    login,
    register,
    updateUser,
} from '../../controllers/auth/authController.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
    loginSchema,
    registerSchema,
} from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), register);
router.get('/getUser', validate({ body: registerSchema }), getUsers);
router.put('/updateuser/:id', validate({ body: registerSchema }), updateUser);
router.delete(
    '/deleteuser/:id',
    validate({ body: registerSchema }),
    deleteUser
);

router.post('/login', validate({ body: loginSchema }), login);

export default router;
