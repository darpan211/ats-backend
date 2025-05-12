import mongoose from 'mongoose';

// Disable mongoose pluralization
mongoose.pluralize(null);
// Create a singleton class for database connection
class Database {
    constructor() {
        this.isConnected = false;
        this.connection = null;
        this.connectionPromise = null;

        // Configure connection options for production
        this.connectionOptions = {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            connectTimeoutMS: 10000,
        };
    }

    // Connect to database with retry logic
    async connect() {
        try {
            // Return existing connection promise if already connecting
            if (this.connectionPromise) {
                return this.connectionPromise;
            }

            // Return existing connection if already connected
            if (this.isConnected) {
                console.log('=> Using existing database connection');
                return Promise.resolve(this.connection);
            }

            console.log('=> Creating new database connection');

            // Create new connection promise
            this.connectionPromise = mongoose.connect(
                process.env.MONGODB_URI,
                this.connectionOptions
            );

            // Wait for connection
            this.connection = await this.connectionPromise;
            this.isConnected = this.connection.connections[0].readyState === 1;

            // Reset connection promise
            this.connectionPromise = null;

            console.log('=> Connected to MongoDB');
            return this.connection;
        } catch (error) {
            this.connectionPromise = null;
            console.error('=> MongoDB connection error:', error);

            // Implement basic retry with exponential backoff
            if (error.name !== 'MongoServerSelectionError') {
                throw error;
            }

            console.log('=> Retrying connection in 5 seconds...');
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return this.connect();
        }
    }

    // Disconnect database (useful for graceful shutdowns)
    async disconnect() {
        if (!this.isConnected) {
            return Promise.resolve();
        }

        try {
            await mongoose.disconnect();
            this.isConnected = false;
            this.connection = null;
            console.log('=> Disconnected from MongoDB');
            return true;
        } catch (error) {
            console.error('=> MongoDB disconnection error:', error);
            return false;
        }
    }
}

// Create and export a singleton instance
const instance = new Database();
// Object.freeze(instance);

export const connectToDatabase = () => instance.connect();
export const disconnectFromDatabase = () => instance.disconnect();
export default instance;
