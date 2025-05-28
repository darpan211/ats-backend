import mongoose from 'mongoose';

const addTiles = new mongoose.Schema(
    {
        tiles_name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        series: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        suitable_place: {
            type: String,
            required: true,
        },
        size: {
            type: String,
            required: true,
        },
        tiles_image: {
            type: String,
            required: true,
        },
        tiles_color: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Tiles = mongoose.model('tiles_details', addTiles);
export default Tiles;
