import User from '../models/users.model.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';
import { HTTPSTATUS } from '../utils/constants.js';
import { uploadToUserS3, deleteFromS3 } from '../services/s3Uploder.js';
import fs from 'fs';

export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        // Exclude password_hash from the result
        const user = await User.findById(id).select('-password_hash').lean();
        if (!user) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'User not found'
            );
        }
        return sendSuccessResponse(res, user, 'Users profile successfully');
    } catch (err) {
        console.error('Get users error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

// export const updateprofile = async (req, res) => {
//     try {

//         const { id } = req.params;
//         const updateData = req.body;
//         const profile_image = req.file;
//         const updateFields = {};
        
//         if (!req.user || req.user.role !== "seller") {
//             return sendErrorResponse(
//                 res,
//                 HTTPSTATUS.unauthorized.code,
//                 `Not Authorize`
//             );
//         }
//         // Check for duplicate gst in metadata.gst
//         if (updateData.gst) {
//             const existingUser = await User.findOne({
//                 "metadata.gst": updateData.gst,
//                 _id: { $ne: id },
//             });
//             if (existingUser) {
//                 return sendErrorResponse(
//                     res,
//                     HTTPSTATUS.alreadyExists.code,
//                     `Gst ${HTTPSTATUS.alreadyExists.message}`
//                 );
//             }
//             // Only update metadata.gst, do not overwrite other metadata fields
//             updateFields["metadata.gst"] = updateData.gst;
//         }
//         if (updateData.address) {
//             updateFields["metadata.address"] = updateData.address;
//         }
//         if (updateData.city) {
//             updateFields["metadata.city"] = updateData.city;
//         }

//         // Add other fields from updateData except gst and metadata
//         Object.keys(updateData).forEach(key => {
//             if (key !== "gst" && key !== "metadata" && key !== "email") {
//                 updateFields[key] = updateData[key];
//             }
//         });

//         if (profile_image) {
//             const findUrl = await User.findById(id);
//             // Only delete from S3 if the URL is valid (not null, undefined, or empty)
//             if (
//                 findUrl.profile_image &&
//                 typeof findUrl.profile_image === 'string' &&
//                 findUrl.profile_image.trim() !== '' &&
//                 findUrl.profile_image !== 'undefined' &&
//                 findUrl.profile_image !== 'null'
//             ) {
//                 await deleteFromS3(findUrl.profile_image);
//             }
//             updateFields.profile_image = await uploadToUserS3(profile_image);
//             fs.unlinkSync(req.file.path);
//         }

//         const updatedProfile = await User.findByIdAndUpdate(
//             id,
//             { $set: updateFields },
//             {
//                 new: true,
//                 runValidators: true,
//             }
//         );

//         if (!updatedProfile) {
//             return sendErrorResponse(
//                 res,
//                 HTTPSTATUS.notFound.code,
//                 'User not found'
//             );
//         }

//         return res.json({
//             success: true,
//             message: 'User profile updated successfully'
//         });
//     } catch (err) {
//         console.error('User profile error:', err);
//         return sendErrorResponse(
//             res,
//             HTTPSTATUS.serverError.code,
//             HTTPSTATUS.serverError.message
//         );
//     }
// };



export const updateprofile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const profile_image = req.file;
        const updateFields = {};

        if (!req.user || req.user.role !== "seller") {
            return sendErrorResponse(
                res,
                HTTPSTATUS.unauthorized.code,
                `Not Authorize`
            );
        }

        // Prevent email update
        if (Object.prototype.hasOwnProperty.call(updateData, "email")) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.badRequest?.code || 400,
                "Email cannot be updated"
            );
        }

        // Check for duplicate gst in metadata.gst
        if (updateData.gst) {
            const existingUser = await User.findOne({
                "metadata.gst": updateData.gst,
                _id: { $ne: id },
            });
            if (existingUser) {
                return sendErrorResponse(
                    res,
                    HTTPSTATUS.alreadyExists.code,
                    `Gst ${HTTPSTATUS.alreadyExists.message}`
                );
            }
            updateFields["metadata.gst"] = updateData.gst;
        }
        if (updateData.address) {
            updateFields["metadata.address"] = updateData.address;
        }
        if (updateData.city) {
            updateFields["metadata.city"] = updateData.city;
        }

        // Add other fields from updateData except gst and metadata
        Object.keys(updateData).forEach(key => {
            if (key !== "gst" && key !== "metadata") {
                updateFields[key] = updateData[key];
            }
        });

        if (profile_image) {
            const findUrl = await User.findById(id);
            if (
                findUrl.profile_image &&
                typeof findUrl.profile_image === 'string' &&
                findUrl.profile_image.trim() !== '' &&
                findUrl.profile_image !== 'undefined' &&
                findUrl.profile_image !== 'null'
            ) {
                await deleteFromS3(findUrl.profile_image);
            }
            updateFields.profile_image = await uploadToUserS3(profile_image);
            fs.unlinkSync(req.file.path);
        }

        const updatedProfile = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedProfile) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'User not found'
            );
        }

        return res.json({
            success: true,
            message: 'User profile updated successfully'
        });
    } catch (err) {
        console.error('User profile error:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};