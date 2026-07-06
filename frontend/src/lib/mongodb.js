import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please add MONGO_URI to your .env.local file");
}

let isConnected = false; // Track connection

export default async function connectMongo() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("MongoDB connection failed"); 
  }
}
export { connectMongo };
