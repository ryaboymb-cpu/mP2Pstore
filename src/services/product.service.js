// Сервис товаров: вся работа с БД через этот слой (хендлеры не лезут в модель напрямую).
import mongoose from "mongoose";
import { Product } from "../db/models/product.model.js";

export const productService = {
  async create(data) {
    // create() валидирует по схеме и сохраняет; ошибки валидации перехватываются выше.
    return Product.create(data);
  },

  async getPage(page, pageSize) {
    const safePage = Number.isInteger(page) && page > 0 ? page : 0;
    const total = await Product.countDocuments();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const items = await Product.find()
      .sort({ createdAt: -1 })
      .skip(safePage * pageSize)
      .limit(pageSize)
      .lean();
    return { items, total, totalPages };
  },

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Product.findById(id).lean();
  },

  async toggleStock(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    const product = await Product.findById(id);
    if (!product) return null;
    product.inStock = !product.inStock;
    await product.save();
    return product.toObject();
  },

  async remove(id) {
    if (!mongoose.isValidObjectId(id)) return false;
    const result = await Product.findByIdAndDelete(id);
    return Boolean(result);
  },
};
