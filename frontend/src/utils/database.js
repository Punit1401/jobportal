// /src/utils/database.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("⚠️ Please add MONGO_URI to .env.local");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { dbName: "shivengroup" })
      .then((mongoose) => {
        console.log("✅ MongoDB Connected");
        return mongoose;
      })
      .catch((err) => console.error("❌ MongoDB Error:", err));
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
