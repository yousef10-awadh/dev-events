import mongoose, { Mongoose } from 'mongoose';

/**
 * Connection string for MongoDB.
 *
 * This should be defined in your environment (e.g. .env.local) as MONGODB_URI.
 * Example: MONGODB_URI="mongodb+srv://user:password@cluster0.mongodb.net/my-db"
 */
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Invalid or missing environment variable: "MONGODB_URI". ' +
      'Please add it to your environment (e.g. .env.local).',
  );
}

/**
 * Shape of the cached Mongoose connection stored on the Node.js global object.
 *
 * We cache the connection in development to avoid creating multiple connections
 * when Next.js hot-reloads server files. In production this will effectively be
 * a singleton because the server code is not reloaded.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the Node.js global type to include a `mongoose` property used for
 * caching the connection.
 */
declare global {
  // eslint-disable-next-line no-var
  // `var` is used intentionally so the value lives across module reloads.
  // This is safe here because we control the type via `MongooseCache`.
  var mongoose: MongooseCache | undefined;
}

// Use the existing cached connection if it exists, otherwise initialize it.
let cached: MongooseCache | undefined = global.mongoose;

if (!cached) {
  cached = { conn: null, promise: null };
  global.mongoose = cached;
}

/**
 * Get a cached Mongoose connection or create a new one if needed.
 *
 * This function should be used by your API routes or server components when
 * they need to interact with MongoDB. It ensures that only a single
 * connection is created per server instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If a connection already exists, return it.
  if (cached?.conn) {
    return cached.conn;
  }

  // If no connection promise exists yet, create one and store it.
  if (!cached?.promise) {
    const options: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    // If connection fails, reset the cached promise so a future call can retry.
    cached!.promise = null;
    throw error;
  }

  return cached!.conn!;
}

// Ensure this file is treated as a module and not a script.
export {};