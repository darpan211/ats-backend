import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../../models/users.model.js';
import Tenantuser from '../../models/tenant.user.map.js';
import { sendSuccessResponse, sendErrorResponse } from '../../utils/helper.js';
import { HTTPSTATUS } from '../../utils/constants.js';

dotenv.config();

export const register = async (req, res) => {
	try {
		const { email, mobile, password, metadata, sellerId, role, ...rest } =
            req.body;

		const existingUser = await User.findOne({
			$or: [{ email }, { mobile }],
		});
		if (existingUser) {
			return sendErrorResponse(
				res,
				HTTPSTATUS.alreadyExists.code,
				`Email or Phone ${HTTPSTATUS.alreadyExists.message}`
			);
		}

		const existingGST = await User.findOne({
			'metadata.gst': metadata?.gst,
		});
		if (existingGST) {
			return sendErrorResponse(
				res,
				HTTPSTATUS.alreadyExists.code,
				`GST number ${HTTPSTATUS.alreadyExists.message}`
			);
		}

		const salt = await bcrypt.genSalt(10);
		const password_hash = await bcrypt.hash(password, salt);

		const newUser = new User({
			email,
			mobile,
			password_hash,
			metadata,
			sellerId,
			role,
			...rest,
		});
		await newUser.save();

		if (role === 'retailer') {
			const tenantMapping = new Tenantuser({
				tenantId: sellerId,
				userId: newUser._id,
				assignedBy: sellerId,
			});
			await tenantMapping.save();
		}

		// Create JWT token
		const token = jwt.sign(
			{ userId: newUser._id, role: newUser.role },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);

		return sendSuccessResponse(
			res,
			{
				userId: newUser._id,
				token,
			},
			'User registered successfully'
		);
	} catch (err) {
		console.error('Register error:', err);
		return sendErrorResponse(
			res,
			HTTPSTATUS.serverError.code,
			HTTPSTATUS.serverError.message
		);
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({
			$or: [{ email: email }],
		});

		if (!user) {
			return sendErrorResponse(
				res,
				HTTPSTATUS.notFound.code,
				'User not found'
			);
		}

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password_hash);
		if (!isMatch) {
			return sendErrorResponse(
				res,
				HTTPSTATUS.unauthorized.code,
				'Invalid Email or Password'
			);
		}

		// Create JWT token
		const token = jwt.sign(
			{ userId: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN } // e.g., "10m"
		);

		return sendSuccessResponse(
			res,
			{
				token,
				user: {
					id: user._id,
					email: user.email,
					mobile: user.mobile,
					role: user.role,
				},
			},
			'Login successful'
		);
	} catch (err) {
		console.error('Login error:', err);
		return sendErrorResponse(
			res,
			HTTPSTATUS.serverError.code,
			HTTPSTATUS.serverError.message
		);
	}
};
