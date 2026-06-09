// Навигация и автоочистка: в чате всегда одно "активное" меню.
// При переходе предыдущее меню редактируется (если можно) или удаляется и шлётся заново.
import { config } from "../config.js";
import { Texts } from "../texts.js";
import {
  buildCatalogKeyboard,
  buildItemKeyboard,
  buildProfileKeyboard,
} from "../keyboards/inline.keyboard.js";
import { productService } from "./product.service.js";
import { isNotModified } from "../utils/format.js";
import { logger } from "../utils/logger.js";

const HTML = { parse_mode: "HTML" };

async function safeDelete(ctx, messageId) {
  if (!messageId) return;
  try {
    await ctx.api.deleteMessage(ctx.chat.id, messageId);
  } catch {
    // сообщение уже удалено/недоступно — это нормально
  }
}

function track(ctx, message, type) {
  ctx.session.menuMessageId = message.message_id;
  ctx.session.menuType = type;
}

export const navigation = {
  async clearMenu(ctx) {
    await safeDelete(ctx, ctx.session.menuMessageId);
    ctx.session.menuMessageId = undefined;
    ctx.session.menuType = undefined;
  },

  async showCatalog(ctx, page = 0, { fresh = false } = {}) {
    const pageSize = config.pageSize;
    let data = await productService.getPage(page, pageSize);
    const currentPage = Math.min(Math.max(0, page), data.totalPages - 1);
    if (currentPage !== page) {
      data = await productService.getPage(currentPage, pageSize);
    }
    ctx.session.catalogPage = currentPage;

    const isAdmin = Boolean(ctx.state?.isAdmin);
    const text = data.total === 0 ? Texts.catalogEmpty(isAdmin) : Texts.catalogHeader(data.total);
    const keyboard = buildCatalogKeyboard(data.items, currentPage, data.totalPages);
    const markup = keyboard.inline_keyboard.length > 0 ? keyboard : undefined;

    // текст -> текст: редактируем на месте (плавно). Иначе пересоздаём.
    if (!fresh && ctx.session.menuType === "text" && ctx.session.menuMessageId) {
      try {
        await ctx.api.editMessageText(ctx.chat.id, ctx.session.menuMessageId, text, {
          ...HTML,
          reply_markup: markup,
        });
        return;
      } catch (err) {
        if (isNotModified(err)) return;
        // иначе — пересоздание ниже
      }
    }

    await this.clearMenu(ctx);
    const sent = await ctx.reply(text, { ...HTML, reply_markup: markup });
    track(ctx, sent, "text");
  },

  async showItem(ctx, productId, { fresh = false } = {}) {
    const product = await productService.getById(productId);
    if (!product) {
      // товар удалён — возвращаемся в каталог
      return this.showCatalog(ctx, ctx.session.catalogPage ?? 0, { fresh: true });
    }

    const caption = Texts.itemCaption(product);
    const keyboard = buildItemKeyboard(product, ctx.session.catalogPage ?? 0, Boolean(ctx.state?.isAdmin));

    // та же карточка (например, переключили наличие) -> редактируем подпись и кнопки.
    if (!fresh && ctx.session.menuType === "photo" && ctx.session.menuMessageId) {
      try {
        await ctx.api.editMessageCaption(ctx.chat.id, ctx.session.menuMessageId, {
          caption,
          ...HTML,
          reply_markup: keyboard,
        });
        return;
      } catch (err) {
        if (isNotModified(err)) return;
        // иначе — пересоздание ниже
      }
    }

    await this.clearMenu(ctx);
    const sent = await ctx.replyWithPhoto(product.photoFileId, {
      caption,
      ...HTML,
      reply_markup: keyboard,
    });
    track(ctx, sent, "photo");
  },

  async showProfile(ctx) {
    await this.clearMenu(ctx);
    const sent = await ctx.reply(Texts.profile(ctx.from), {
      ...HTML,
      reply_markup: buildProfileKeyboard(),
    });
    track(ctx, sent, "text");
  },

  // Меняет только кнопки текущей карточки (подтверждение удаления).
  async setItemKeyboard(ctx, keyboard) {
    if (!ctx.session.menuMessageId) return;
    try {
      await ctx.api.editMessageReplyMarkup(ctx.chat.id, ctx.session.menuMessageId, {
        reply_markup: keyboard,
      });
    } catch (err) {
      logger.warn("Не удалось обновить клавиатуру карточки:", err.message);
    }
  },
};
