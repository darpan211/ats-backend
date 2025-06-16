import express, { Router } from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './db.config.js'; // adjust path if needed
import router from './src/routes/index.js';
import cors from 'cors';
import multer from 'multer';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(
    cors({
        origin: 'http://localhost:5173', // or use "*" if not restricted
        credentials: true,
    })
);

app.use(express.json());

app.use('/api/v1', router);
app.use('/uploads', express.static('uploads'));
// After all your routes
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.startsWith('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// Start server only after DB connection is successful
connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error(
            'Failed to start server due to DB connection error:',
            error
        );
        process.exit(1); // Exit with failure
    });

// Optional: Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n SIGINT received. Closing MongoDB connection...');
    await disconnectFromDatabase();
    process.exit(0);
});
