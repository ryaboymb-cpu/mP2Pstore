// Регистрация middleware и обработчиков. Порядок регистрации критичен.
import { GrammyError, HttpError } from "grammy";
import { config } from "../config.js";
import { escapeRegex } from "../utils/format.js";
import { logger } from "../utils/logger.js";
import { Buttons } from "../texts.js";
import { Cb, CbPattern } from "../keyboards/inline.keyboard.js";

import { createSession } from "../middlewares/session.middleware.js";
import { sequentialize } from "../middlewares/sequentialize.middleware.js";
import { attachAdmin } from "../middlewares/admin.middleware.js";

import { handleStart } from "./start.handler.js";
import { handleAdminSecret } from "./adminAuth.handler.js";
import {
  handleSellStart,
  handleSellCancelCommand,
  handleSellCancel,
  sellInputMiddleware,
} from "./sell.handler.js";
import {
  handleCatalogButton,
  handleProfileButton,
  handleCatalogPage,
  handleItemView,
} from "./catalog.handler.js";
import {
  handleToggleStock,
  handleDeleteRequest,
  handleDeleteConfirm,
} from "./adminActions.handler.js";

export function registerHandlers(bot) {
  // 1. Инфраструктура: последовательность -> сессия -> флаг админа.
  bot.use(sequentialize);
  bot.use(createSession());
  bot.use(attachAdmin);

  // 2. Скрытая команда администратора (точное совпадение текста, не в меню).
  bot.hears(new RegExp(`^${escapeRegex(config.adminSecret)}$`), handleAdminSecret);

  // 3. Команды.
  bot.command("start", handleStart);
  bot.command("sell", handleSellStart);
  bot.command("cancel", handleSellCancelCommand);

  // 4. Пошаговый ввод /sell — поглощает текст/фото, пока активен (после команд, до кнопок).
  bot.use(sellInputMiddleware);

  // 5. Нижние кнопки (точное совпадение).
  bot.hears(new RegExp(`^${escapeRegex(Buttons.CATALOG)}$`), handleCatalogButton);
  bot.hears(new RegExp(`^${escapeRegex(Buttons.PROFILE)}$`), handleProfileButton);

  // 6. Inline-кнопки (callback_query).
  bot.callbackQuery(Cb.cancelSell, handleSellCancel);
  bot.callbackQuery(Cb.noop, (ctx) => ctx.answerCallbackQuery().catch(() => {}));
  bot.callbackQuery(CbPattern.page, handleCatalogPage);
  bot.callbackQuery(CbPattern.item, handleItemView);
  bot.callbackQuery(CbPattern.stock, handleToggleStock);
  bot.callbackQuery(CbPattern.delOk, handleDeleteConfirm);
  bot.callbackQuery(CbPattern.del, handleDeleteRequest);

  // 7. Глобальный перехват ошибок.
  bot.catch((err) => {
    const ctx = err.ctx;
    const error = err.error;
    if (error instanceof GrammyError) {
      logger.error("Ошибка Telegram API:", error.description);
    } else if (error instanceof HttpError) {
      logger.error("Сетевая ошибка:", error.message);
    } else {
      logger.error("Необработанная ошибка:", error);
    }
    void Promise.resolve(
      ctx?.reply?.("Произошла ошибка. Попробуйте ещё раз чуть позже.")
    ).catch(() => {});
  });
}
