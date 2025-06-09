import express from 'express';
import {
    deleteUser,
    getUsers,
    login,
    register,
    updateUser,
    getUserById,
} from '../../controllers/auth/authController.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
    loginSchema,
    registerSchema,
    updateSchema,
} from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), register);
router.get('/getUser', getUsers);
router.put('/updateUser/:id', validate({ body: updateSchema }), updateUser);
router.delete('/deleteUser/:id', deleteUser);

router.post('/login', validate({ body: loginSchema }), login);
router.get('/getUserById/:id', getUserById);
export default router;
