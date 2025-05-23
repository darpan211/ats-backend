import mongoose from 'mongoose';

const sizesSchema = new mongoose.Schema(
    {
        series: {
            type: String,
        },
    },
    { timestamps: true }
);
const SizesModel = mongoose.model('Series', sizesSchema);
export default SizesModel;

