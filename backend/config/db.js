import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const rawEnv = process.env.MONGO_URI;
  const isEnvPresent = !!rawEnv;
  const MONGO_URI = rawEnv || "mongodb://127.0.0.1:27017/onecare"; // explicit 127.0.0.1
  console.log("[DB] Env MONGO_URI present:", isEnvPresent);
  console.log("[DB] Using connection string:", MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    if (!isEnvPresent) {
      console.log("ℹ️ No MONGO_URI provided. Started with local fallback. Is local mongod running?");
    } else if (MONGO_URI.startsWith('mongodb+srv://')) {
      console.log("� Atlas checklist: 1) IP allowlist 0.0.0.0/0 or your IP 2) Correct username/password 3) DNS reachable 4) Network not blocking 27017/ SRV lookups");
    }
  }
};

export default connectDB;