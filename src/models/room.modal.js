import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
    {
        template_name: {
            type:String,
            required:true
        },

        category:{
            type:String,
            required:true
        },

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
            required:true
        },
    },
    { timestamps: true }
);

const Room = mongoose.model('Room', roomSchema);
export default Room;
