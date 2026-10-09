import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectionCache =
  globalThis.__nextOneMongoConnection ||
  (globalThis.__nextOneMongoConnection = { promise: null });

const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not configured");
  }

  if (!connectionCache.promise) {
    connectionCache.promise = mongoose.connect(process.env.MONGO_URL);
  }

  const pendingConnection = connectionCache.promise;

  try {
    await pendingConnection;
    return mongoose.connection;
  } finally {
    if (connectionCache.promise === pendingConnection) {
      connectionCache.promise = null;
    }
  }
};

export default connectMongo;
