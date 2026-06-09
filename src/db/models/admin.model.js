// Модель администратора (тот, кто прошёл по скрытой команде).
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String, default: null },
  },
  { timestamps: true }
);

export const Admin = mongoose.models.Admin ?? mongoose.model("Admin", adminSchema);
