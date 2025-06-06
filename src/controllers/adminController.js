import AdminUser from '../models/admin.create.model.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';
import { HTTPSTATUS } from '../utils/constants.js';

export const createAdmin = async (req, res) => {
    try {
        const { admin_name, email, password, role } = req.body;

        if (role !== 'admin') {
            return sendErrorResponse(
                res,
                HTTPSTATUS.unauthorized.code,
                'User is not admin'
            );
        }

        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.alreadyExists.code,
                `Email ${HTTPSTATUS.alreadyExists.message}`
            );
        }

        const newUser = new AdminUser({
            admin_name,
            email,
            password,
        });
        await newUser.save();

        return sendSuccessResponse(res, newUser, 'User created successfully');
    } catch (err) {
        console.error('Register error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
export const getAllUser = async (req, res) => {
    try {
        const admins = await AdminUser.find().lean();
        return sendSuccessResponse(res, admins, 'Admins fetched successfully');
    } catch (err) {
        console.error('Get admins error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await AdminUser.findById(id).lean();

        if (!admin) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Admin not found'
            );
        }

        return sendSuccessResponse(res, admin, 'Admin fetched successfully');
    } catch (err) {
        console.error('Get admin by ID error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Prevent role change to non-admin
        if (updateData.role && updateData.role !== 'admin') {
            return sendErrorResponse(
                res,
                HTTPSTATUS.unauthorized.code,
                'User is not admin'
            );
        }

        // Check for duplicate email if email is being updated
        if (updateData.email) {
            const existingUser = await AdminUser.findOne({
                email: updateData.email,
                _id: { $ne: id },
            });
            if (existingUser) {
                return sendErrorResponse(
                    res,
                    HTTPSTATUS.alreadyExists.code,
                    `Email ${HTTPSTATUS.alreadyExists.message}`
                );
            }
        }

        const updatedAdmin = await AdminUser.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedAdmin) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Admin not found'
            );
        }

        return sendSuccessResponse(
            res,
            updatedAdmin,
            'Admin updated successfully'
        );
    } catch (err) {
        console.error('Update admin error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAdmin = await AdminUser.findByIdAndDelete(id);

        if (!deletedAdmin) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Admin not found'
            );
        }

        return sendSuccessResponse(
            res,
            deletedAdmin,
            'Admin deleted successfully'
        );
    } catch (err) {
        console.error('Delete admin error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
