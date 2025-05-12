import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		company_name: String,
		owner_name: String,
		email: { type: String, unique: true, sparse: true },
		mobile: { type: String, unique: true, sparse: true },
		password_hash: String,
		role: {
			type: String,
			enum: ['superadmin', 'seller', 'retailer'],
			required: true,
		},
		status: {
			type: String,
			enum: ['Active', 'Inactive'],
			default: 'Active',
		},
		metadata: mongoose.Schema.Types.Mixed,
		roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
	},
	{ timestamps: true }
);

const User = mongoose.model('users', userSchema);
export default User;
