// Чистые константы. Без побочных эффектов, чтобы их можно было импортировать где угодно.

// Ограничения на длину полей товара
export const Limits = Object.freeze({
  NAME: 100,
  DESCRIPTION: 800,
  PRICE: 40,
});

// Шаги пошагового добавления товара через /sell
export const SellStep = Object.freeze({
  PHOTO: "PHOTO",
  NAME: "NAME",
  DESCRIPTION: "DESCRIPTION",
  PRICE: "PRICE",
  AVITO: "AVITO",
});
