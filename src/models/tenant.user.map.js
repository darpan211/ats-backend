import mongoose from 'mongoose';

const tenantUserMappingSchema = new mongoose.Schema({
    tenantId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
    userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});
const Tenantuser = mongoose.model(
	'tenant_users_mapping',
	tenantUserMappingSchema
);
export default Tenantuser;
