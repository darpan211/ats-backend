import mongoose from 'mongoose';

const sizesSchema = new mongoose.Schema(
    {
        height: {
            type: String,
            required: true,
        },
        width: {
            type: String,
            required: true,
        },
        sizes: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const sizesModel = mongoose.model('size', sizesSchema);
export default sizesModel;
