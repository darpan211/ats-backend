import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema(
    {
        category: {
            type: String,
        },
        series: {
            type: String,
        },
    },
    { timestamps: true }
);

const Attribute = mongoose.model('Category', attributeSchema);
export default Attribute;
