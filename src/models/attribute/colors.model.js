import mongoose from 'mongoose';

const colorsSchema = new mongoose.Schema(
    {
        colors: {
            type: String,
        },
     
    },
    { timestamps: true }
);

const colorsModel = mongoose.model('colors',  colorsSchema);
export default colorsModel;
