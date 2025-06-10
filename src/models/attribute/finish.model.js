import mongoose from 'mongoose';

const finishSchema = new mongoose.Schema(
    {
        finish: {
            type: String,
        },
    },
    { timestamps: true }
);

const finishModel = mongoose.model('finish', finishSchema);
export default finishModel;
