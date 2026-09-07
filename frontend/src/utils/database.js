// /src/utils/database.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const connectionUri = MONGO_URI || "mongodb://127.0.0.1:27017/shivengroup";

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(connectionUri, { dbName: "shivengroup" })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected");
        return mongoose;
      })
      .catch((err) => console.error("❌ MongoDB Error:", err));
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
