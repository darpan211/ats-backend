import mongoose from 'mongoose';

const sizesSchema = new mongoose.Schema(
    {
        sizes: {
            type: String,
        },
    },
    { timestamps: true }
);

const sizesModel = mongoose.model('size', sizesSchema);
export default sizesModel;
