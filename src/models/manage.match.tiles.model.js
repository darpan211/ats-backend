import mongoose from 'mongoose';

const matchTilesSchema = new mongoose.Schema({
    tiles_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tiles_details',
    },
    match_tiles_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tiles_details',
        },
    ],
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
});

const MatchTiles = mongoose.model('manage_match_tiles', matchTilesSchema);

export default MatchTiles;
