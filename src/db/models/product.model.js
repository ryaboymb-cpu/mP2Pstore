// Модель товара каталога.
import mongoose from "mongoose";
import { Limits } from "../../constants.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: Limits.NAME },
    description: { type: String, required: true, trim: true, maxlength: Limits.DESCRIPTION },
    price: { type: String, required: true, trim: true, maxlength: Limits.PRICE },
    photoFileId: { type: String, required: true },
    avitoUrl: { type: String, required: true, trim: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Защита от повторной регистрации при hot-reload (npm run dev).
export const Product = mongoose.models.Product ?? mongoose.model("Product", productSchema);
