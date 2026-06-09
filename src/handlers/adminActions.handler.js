// Админ-действия в карточке: переключение наличия и удаление (с подтверждением).
import { buildDeleteConfirmKeyboard } from "../keyboards/inline.keyboard.js";
import { productService } from "../services/product.service.js";
import { navigation } from "../services/navigation.service.js";
import { logger } from "../utils/logger.js";

function ensureAdmin(ctx) {
  if (ctx.state?.isAdmin) return true;
  ctx.answerCallbackQuery({ text: "Недостаточно прав", show_alert: true }).catch(() => {});
  return false;
}

export async function handleToggleStock(ctx) {
  if (!ensureAdmin(ctx)) return;
  const id = ctx.match[1];
  try {
    const updated = await productService.toggleStock(id);
    if (!updated) {
      await ctx.answerCallbackQuery({ text: "Товар не найден" }).catch(() => {});
      return navigation.showCatalog(ctx, ctx.session.catalogPage ?? 0, { fresh: true });
    }
    await ctx
      .answerCallbackQuery({ text: updated.inStock ? "Снова в наличии" : "Снято с продажи" })
      .catch(() => {});
    await navigation.showItem(ctx, id, { fresh: false }); // обновит подпись/кнопки на месте
  } catch (err) {
    logger.error("Переключение наличия:", err.message);
    await ctx.answerCallbackQuery({ text: "Ошибка" }).catch(() => {});
  }
}

export async function handleDeleteRequest(ctx) {
  if (!ensureAdmin(ctx)) return;
  await ctx.answerCallbackQuery().catch(() => {});
  const id = ctx.match[1];
  await navigation.setItemKeyboard(ctx, buildDeleteConfirmKeyboard(id));
}

export async function handleDeleteConfirm(ctx) {
  if (!ensureAdmin(ctx)) return;
  const id = ctx.match[1];
  try {
    await productService.remove(id);
    await ctx.answerCallbackQuery({ text: "Товар удалён" }).catch(() => {});
    await navigation.showCatalog(ctx, ctx.session.catalogPage ?? 0, { fresh: true });
  } catch (err) {
    logger.error("Удаление товара:", err.message);
    await ctx.answerCallbackQuery({ text: "Ошибка" }).catch(() => {});
  }
}
