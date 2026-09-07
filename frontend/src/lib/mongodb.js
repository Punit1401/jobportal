import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shivengroup";

let isConnected = false; // Track connection

async function connectMongo() {
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
export default connectMongo;
export { connectMongo, connectMongo as connectDB };
