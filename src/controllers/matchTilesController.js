import MatchTiles from '../models/manage.match.tiles.model.js';
import Tiles from '../models/tiles.model.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/helper.js';
import { HTTPSTATUS } from '../utils/constants.js';

export const createMatchTiles = async (req, res) => {
    try {
        const { tiles_id, match_tiles_id } = req.body; // match_tiles_id is now an array
        const userId = req.user.userId;

        // Check if the main tile exists
        const mainTile = await Tiles.findById(tiles_id);
        if (!mainTile) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.badRequest.code,
                'Invalid tile ID provided'
            );
        }

        // Check if all match tile IDs are valid
        const matchedTiles = await Tiles.find({ _id: { $in: match_tiles_id } });
        if (matchedTiles.length !== match_tiles_id.length) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.badRequest.code,
                'One or more match tile IDs are invalid'
            );
        }

        const saveTiles = new MatchTiles({
            tiles_id: mainTile._id,
            match_tiles_id: match_tiles_id, // this is an array now
            created_by: userId,
        });

        await saveTiles.save();

        return sendSuccessResponse(
            res,
            saveTiles,
            'Match tiles created successfully'
        );
    } catch (err) {
        console.error('Error in createMatchTiles:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getmatchTiles = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Sort by _id descending (latest first)
        const getMatchTiles = await MatchTiles.find({ created_by: userId }).sort({ _id: -1 });

        if (getMatchTiles.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No match tiles found',
                result: [],
            });
        }

        // Collect all unique tile IDs
        const tileIdsSet = new Set();
        getMatchTiles.forEach((tile) => {
            tileIdsSet.add(tile.tiles_id.toString());
            tile.match_tiles_id.forEach((id) => tileIdsSet.add(id.toString()));
        });

        const tileIds = Array.from(tileIdsSet);

        // Fetch all related tiles
        const tiles = await Tiles.find({ _id: { $in: tileIds } });

        // Create map of tile ID to tile data
        const tileMap = {};
        tiles.forEach((tile) => {
            tileMap[tile._id.toString()] = tile;
        });

        // Build response with full tile data
        const result = getMatchTiles.map((tile) => ({
            _id: tile._id,
            tiles_id: tileMap[tile.tiles_id.toString()] || null,
            match_tiles_id: tile.match_tiles_id.map(
                (matchId) => tileMap[matchId.toString()] || null
            ),
        }));

        return res.status(200).json({
            status: true,
            message: 'Match tiles fetched successfully',
            result,
            order: 'Desc'
        });
    } catch (err) {
        console.error('Error in getmatchTiles:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const deleteMatchTiles = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.badRequest.code,
                'Match tile ID is required'
            );
        }

        const matchTile = await MatchTiles.findById(id);
        if (!matchTile) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Match tile not found'
            );
        }

        await MatchTiles.findByIdAndDelete(id);
        return sendSuccessResponse(
            res,
            null,
            'Match tile deleted successfully'
        );
    } catch (err) {
        console.error('Error in deleteMatchTiles:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const updateMatchTiles = async (req, res) => {
    try {
        const { id } = req.params;
        const { tiles_id, match_tiles_id } = req.body;
        const userId = req.user.userId;

        const matchTile = await MatchTiles.findById(id);
        if (!matchTile) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Match tile not found'
            );
        }

        // Validate and update primary tile
        if (tiles_id) {
            const tileOne = await Tiles.findById(tiles_id);
            if (!tileOne) {
                return sendErrorResponse(
                    res,
                    HTTPSTATUS.badRequest.code,
                    'Invalid tiles_id'
                );
            }
            matchTile.tiles_id = tileOne._id;
        }

        // Validate and update match tiles (as array)
        if (match_tiles_id && Array.isArray(match_tiles_id)) {
            const matchedTiles = await Tiles.find({
                _id: { $in: match_tiles_id },
            });
            if (matchedTiles.length !== match_tiles_id.length) {
                return sendErrorResponse(
                    res,
                    HTTPSTATUS.badRequest.code,
                    'One or more match_tiles_id are invalid'
                );
            }
            matchTile.match_tiles_id = match_tiles_id;
        }

        // Optionally update created_by (if needed)
        matchTile.created_by = userId;

        await matchTile.save();

        return sendSuccessResponse(
            res,
            matchTile,
            'Match tile updated successfully'
        );
    } catch (err) {
        console.error('Error in updateMatchTiles:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};

export const getMatchTilesById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.badRequest.code,
                'Match tile ID is required'
            );
        }

        const matchTile = await MatchTiles.findById(id);
        if (!matchTile) {
            return sendErrorResponse(
                res,
                HTTPSTATUS.notFound.code,
                'Match tile not found'
            );
        }

        // Collect all tile IDs to fetch
        const tileIdsSet = new Set();
        tileIdsSet.add(matchTile.tiles_id.toString());
        matchTile.match_tiles_id.forEach((id) => tileIdsSet.add(id.toString()));
        const tileIds = Array.from(tileIdsSet);

        // Fetch full tile data
        const tiles = await Tiles.find({ _id: { $in: tileIds } });

        const tileMap = {};
        tiles.forEach((tile) => {
            tileMap[tile._id.toString()] = tile;
        });

        const result = {
            _id: matchTile._id,
            tiles_id: tileMap[matchTile.tiles_id.toString()] || null,
            match_tiles_id: matchTile.match_tiles_id.map(
                (matchId) => tileMap[matchId.toString()] || null
            ),
            created_by: matchTile.created_by,
        };

        return sendSuccessResponse(
            res,
            result,
            'Match tile retrieved successfully'
        );
    } catch (err) {
        console.error('Error in getMatchTilesById:', err);
        return sendErrorResponse(
            res,
            HTTPSTATUS.serverError.code,
            HTTPSTATUS.serverError.message
        );
    }
};
