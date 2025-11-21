import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let cachedClient = null;

export async function connectToDatabase() {
  try {
    // Try to reuse cached connection if it's still valid
    if (cachedClient) {
      try {
        // Test if connection is still alive with a ping
        await cachedClient.db('admin').command({ ping: 1 });
        console.log('✓ Using cached MongoDB connection');
        return cachedClient.db('cloudnerves');
      } catch {
        console.log('Connection stale, reconnecting...');
        cachedClient = null;
      }
    }

    console.log('🔗 Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    await client.connect();
    console.log('✓ Connected to MongoDB');

    // Test the connection
    await client.db('admin').command({ ping: 1 });

    cachedClient = client;
    return client.db('cloudnerves');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cachedClient = null;
    throw error;
  }
}
