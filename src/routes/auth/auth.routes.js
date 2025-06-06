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
} from '../../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), register);
router.get('/getUser', getUsers);
router.put('/updateuser/:id', validate({ body: registerSchema }), updateUser);
router.delete('/deleteuser/:id', deleteUser);

router.post('/login', validate({ body: loginSchema }), login);
router.get('/getuserbyId/:id', getUserById);
export default router;
