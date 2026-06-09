// Сервис администраторов. ID кэшируются в памяти, источник — ENV (ADMIN_IDS) + БД.
import { Admin } from "../db/models/admin.model.js";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

const adminIds = new Set(config.adminIds);

export const adminService = {
  // Загружает админов из БД в кэш при старте.
  async init() {
    const docs = await Admin.find().select("telegramId").lean();
    for (const doc of docs) adminIds.add(doc.telegramId);
    logger.info(`Администраторов загружено: ${adminIds.size}`);
  },

  isAdmin(telegramId) {
    return typeof telegramId === "number" && adminIds.has(telegramId);
  },

  // Выдаёт права (вызывается по скрытой команде) и сохраняет в БД.
  async grant(telegramId, username = null) {
    adminIds.add(telegramId);
    await Admin.updateOne({ telegramId }, { $set: { username } }, { upsert: true });
  },
};
