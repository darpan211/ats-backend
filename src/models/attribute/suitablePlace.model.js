import mongoose from 'mongoose';

const suitablePlaceSchema = new mongoose.Schema(
    {
        suitablePlace: {
            type: String,
        },
    },
    { timestamps: true }
);
const suitablePlaceModel = mongoose.model('SuitablePlace', suitablePlaceSchema);
export default suitablePlaceModel;
