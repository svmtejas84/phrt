import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import predictRoutes from "./routes/predict.js";

// Load environment variables
dotenv.config();
// Python model dtype conversion fix applied v3 - LightGBM strict dtypes

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/predict", predictRoutes);

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState });
});

const PORT = process.env.PORT || 5000;
const hasEnv = !!process.env.MONGO_URI;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onecare";

console.log('[Startup] Env MONGO_URI present:', hasEnv);
console.log('[Startup] Attempting MongoDB connect to', MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Mongo connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Mongo connection failed:', err.message);
    console.log('➡️ Starting server anyway (limited mode)');
    app.listen(PORT, () => console.log(`Server (no DB) on port ${PORT}`));
  });
