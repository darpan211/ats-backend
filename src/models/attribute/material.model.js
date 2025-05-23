import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
    {
        material: {
            type: String,
        },
     
    },
    { timestamps: true }
);

const materialModel = mongoose.model('material',  materialSchema);
export default materialModel;
