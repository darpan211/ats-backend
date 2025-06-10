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
        thickness: {
            type: String,
            required: true,
        },
        tiles_image: {
            type: String,
            required: true,
        },
        tiles_color: { type: String, default: null },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        favorite: {
            type: Boolean,
            default: false,
        },
        priority: {
            enum: ['low', 'medium', 'high'],
            type: String,
            default: 'medium',
        },
    },
    { timestamps: true }
);

const Tiles = mongoose.model('tiles_details', addTiles);
export default Tiles;
