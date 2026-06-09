// Inline-клавиатуры и единая схема callback-данных.
import { InlineKeyboard } from "grammy";
import { Buttons } from "../texts.js";
import { contactUrl } from "../config.js";
import { truncate } from "../utils/format.js";

// Сборщики строк callback_data (одно место — нет рассинхрона между кнопками и обработчиками).
export const Cb = Object.freeze({
  page: (n) => `cat:page:${n}`,
  item: (id) => `item:view:${id}`,
  stock: (id) => `admin:stock:${id}`,
  del: (id) => `admin:del:${id}`,
  delOk: (id) => `admin:delok:${id}`,
  cancelSell: "sell:cancel",
  noop: "noop",
});

// Шаблоны для сопоставления callback_data в обработчиках (id = ObjectId, 24 hex).
export const CbPattern = Object.freeze({
  page: /^cat:page:(\d+)$/,
  item: /^item:view:([a-f\d]{24})$/i,
  stock: /^admin:stock:([a-f\d]{24})$/i,
  del: /^admin:del:([a-f\d]{24})$/i,
  delOk: /^admin:delok:([a-f\d]{24})$/i,
});

// Список товаров на странице + пагинация.
export function buildCatalogKeyboard(items, page, totalPages) {
  const kb = new InlineKeyboard();

  for (const item of items) {
    const id = item._id.toString();
    const label = item.inStock
      ? truncate(item.name, 42)
      : `${truncate(item.name, 30)} — нет в наличии`;
    kb.text(label, Cb.item(id)).row();
  }

  if (totalPages > 1) {
    if (page > 0) kb.text(Buttons.PREV, Cb.page(page - 1));
    kb.text(`${page + 1}/${totalPages}`, Cb.noop);
    if (page < totalPages - 1) kb.text(Buttons.NEXT, Cb.page(page + 1));
  }

  return kb;
}

// Карточка товара. Для админа добавляются кнопки управления.
export function buildItemKeyboard(product, page, isAdmin) {
  const id = product._id.toString();
  const kb = new InlineKeyboard()
    .url(Buttons.AVITO, product.avitoUrl)
    .url(Buttons.DM, contactUrl)
    .row();

  if (isAdmin) {
    kb.text(product.inStock ? Buttons.MARK_OUT : Buttons.MARK_IN, Cb.stock(id))
      .text(Buttons.DELETE, Cb.del(id))
      .row();
  }

  kb.text(Buttons.BACK, Cb.page(page));
  return kb;
}

export function buildProfileKeyboard() {
  return new InlineKeyboard().url(Buttons.CONTACT, contactUrl);
}

export function buildDeleteConfirmKeyboard(productId) {
  return new InlineKeyboard()
    .text(Buttons.DELETE_CONFIRM, Cb.delOk(productId))
    .row()
    .text(Buttons.CANCEL, Cb.item(productId));
}
