import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn('MONGODB_URI environment variable is not defined. Database connection will fail.');
}

const client = new MongoClient(uri || '', {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db: any = null;

export async function connectToDatabase() {
  if (db) return db;
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB Atlas!");
    
    db = client.db('crowdfundx');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
}
