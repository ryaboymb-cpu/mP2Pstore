// Обработчики витрины: кнопки Каталог/Профиль, пагинация, открытие карточки.
import { navigation } from "../services/navigation.service.js";
import { Texts } from "../texts.js";
import { logger } from "../utils/logger.js";

export async function handleCatalogButton(ctx) {
  try {
    await navigation.showCatalog(ctx, 0, { fresh: true });
  } catch (err) {
    logger.error("Каталог:", err.message);
    await ctx.reply(Texts.genericError(), { parse_mode: "HTML" }).catch(() => {});
  }
}

export async function handleProfileButton(ctx) {
  try {
    await navigation.showProfile(ctx);
  } catch (err) {
    logger.error("Профиль:", err.message);
    await ctx.reply(Texts.genericError(), { parse_mode: "HTML" }).catch(() => {});
  }
}

export async function handleCatalogPage(ctx) {
  await ctx.answerCallbackQuery().catch(() => {});
  const page = Number(ctx.match[1]);
  try {
    await navigation.showCatalog(ctx, Number.isFinite(page) ? page : 0, { fresh: false });
  } catch (err) {
    logger.error("Пагинация каталога:", err.message);
  }
}

export async function handleItemView(ctx) {
  await ctx.answerCallbackQuery().catch(() => {});
  const id = ctx.match[1];
  try {
    await navigation.showItem(ctx, id, { fresh: false });
  } catch (err) {
    logger.error("Просмотр товара:", err.message);
  }
}
