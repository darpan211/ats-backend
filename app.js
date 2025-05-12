import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from './db.config.js'; // adjust path if needed
import router from './src/routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.json());

app.use('/api/v1', router);

// Start server only after DB connection is successful
connectToDatabase()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`✅ Server is running on http://localhost:${PORT}`);
		});
	})
	.catch((error) => {
		console.error(
			'❌ Failed to start server due to DB connection error:',
			error
		);
		process.exit(1); // Exit with failure
	});

// Optional: Graceful shutdown
process.on('SIGINT', async () => {
	console.log('\n🛑 SIGINT received. Closing MongoDB connection...');
	await disconnectFromDatabase();
	process.exit(0);
});
