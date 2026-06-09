// Пошаговое добавление товара: фото -> название -> описание -> цена -> ссылка на Авито.
import { InlineKeyboard } from "grammy";
import { SellStep, Limits } from "../constants.js";
import { Texts, Buttons } from "../texts.js";
import { Cb } from "../keyboards/inline.keyboard.js";
import { isValidHttpUrl } from "../utils/format.js";
import { productService } from "../services/product.service.js";
import { navigation } from "../services/navigation.service.js";
import { logger } from "../utils/logger.js";

const cancelKeyboard = () => new InlineKeyboard().text(Buttons.CANCEL, Cb.cancelSell);
const ask = (ctx, text) => ctx.reply(text, { parse_mode: "HTML", reply_markup: cancelKeyboard() });

export async function handleSellStart(ctx) {
  if (!ctx.state?.isAdmin) return; // скрытно игнорируем для обычных пользователей
  await navigation.clearMenu(ctx);
  ctx.session.sell = { step: SellStep.PHOTO, draft: {} };
  await ask(ctx, Texts.sellAskPhoto());
}

export async function handleSellCancelCommand(ctx) {
  if (!ctx.session.sell) return;
  ctx.session.sell = null;
  await ctx.reply(Texts.sellCancelled(), { parse_mode: "HTML" });
}

export async function handleSellCancel(ctx) {
  ctx.session.sell = null;
  await ctx.answerCallbackQuery({ text: "Отменено" }).catch(() => {});
  try {
    await ctx.editMessageText(Texts.sellCancelled(), { parse_mode: "HTML" });
  } catch {
    // сообщение могло устареть — игнорируем
  }
}

// Поглощает текст/фото, пока активен флоу /sell. Иначе передаёт дальше (next).
export async function sellInputMiddleware(ctx, next) {
  const flow = ctx.session?.sell;
  if (!flow) return next();
  if (!ctx.message) return next();
  // Команды (например /start, /cancel) обрабатываются раньше — здесь их пропускаем дальше.
  if (typeof ctx.message.text === "string" && ctx.message.text.startsWith("/")) return next();
  if (!ctx.state?.isAdmin) {
    ctx.session.sell = null;
    return next();
  }

  if (flow.step === SellStep.PHOTO) {
    const photos = ctx.message.photo;
    if (!photos || photos.length === 0) {
      return ask(ctx, Texts.sellNeedPhoto());
    }
    flow.draft.photoFileId = photos[photos.length - 1].file_id; // самое крупное превью
    flow.step = SellStep.NAME;
    return ask(ctx, Texts.sellAskName());
  }

  const text = ctx.message.text?.trim();
  if (!text) {
    return ask(ctx, Texts.sellNeedText());
  }

  if (flow.step === SellStep.NAME) {
    if (text.length > Limits.NAME) return ask(ctx, Texts.sellTooLong(Limits.NAME));
    flow.draft.name = text;
    flow.step = SellStep.DESCRIPTION;
    return ask(ctx, Texts.sellAskDescription());
  }

  if (flow.step === SellStep.DESCRIPTION) {
    if (text.length > Limits.DESCRIPTION) return ask(ctx, Texts.sellTooLong(Limits.DESCRIPTION));
    flow.draft.description = text;
    flow.step = SellStep.PRICE;
    return ask(ctx, Texts.sellAskPrice());
  }

  if (flow.step === SellStep.PRICE) {
    if (text.length > Limits.PRICE) return ask(ctx, Texts.sellTooLong(Limits.PRICE));
    flow.draft.price = text;
    flow.step = SellStep.AVITO;
    return ask(ctx, Texts.sellAskAvito());
  }

  if (flow.step === SellStep.AVITO) {
    if (!isValidHttpUrl(text)) return ask(ctx, Texts.sellBadUrl());
    flow.draft.avitoUrl = text;
    try {
      const product = await productService.create({ ...flow.draft });
      ctx.session.sell = null;
      await ctx.reply(Texts.sellSaved(product.name), { parse_mode: "HTML" });
      await navigation.showItem(ctx, product._id.toString(), { fresh: true });
    } catch (err) {
      logger.error("Сохранение товара:", err.message);
      ctx.session.sell = null;
      await ctx.reply(Texts.sellError(), { parse_mode: "HTML" });
    }
    return;
  }

  // Некорректное состояние — сбрасываем и пропускаем дальше.
  ctx.session.sell = null;
  return next();
}
