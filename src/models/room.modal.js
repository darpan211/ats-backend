import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        template_name: String,

        category: String,

        room_type: {
            type: String,
            enum: ['bathroom', 'kitchen', 'living room'],
        },

        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },

        description: {
            type: String,
        },

        upload_image: {
            type: String,
        },
    },
    { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
