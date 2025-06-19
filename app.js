import express, { Router } from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './db.config.js'; // adjust path if needed
import router from './src/routes/index.js';
import cors from 'cors';
import multer from 'multer';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://atv-frontend-alpha.vercel.app'
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/v1', router);
app.use('/uploads', express.static('uploads'));
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Only files of 5MB or less are supported.'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    if (err.message.startsWith('Only image files are allowed')) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
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
