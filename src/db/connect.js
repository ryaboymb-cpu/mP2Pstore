// Подключение к MongoDB через Mongoose.
import mongoose from "mongoose";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => logger.info("MongoDB: подключено"));
  mongoose.connection.on("error", (err) => logger.error("MongoDB:", err.message));
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB: соединение потеряно"));

  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
