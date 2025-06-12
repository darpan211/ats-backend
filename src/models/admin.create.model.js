import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema(
    {
        admin_name: { type: String },
        email: { type: String, unique: true, sparse: true },
        password: String,
        role: {
            type: String
        }
    },
    { timestamps: true }
);

const AdminUser = mongoose.model('admin_user', adminUserSchema);
export default AdminUser;
