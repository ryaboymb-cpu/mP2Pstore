// Все пользовательские тексты и подписи кнопок собраны здесь (один источник правды).
import { config } from "./config.js";
import { escapeHtml } from "./utils/format.js";

const store = () => escapeHtml(config.storeName);

export const Buttons = Object.freeze({
  CATALOG: "Каталог",
  PROFILE: "Профиль",
  BACK: "Назад",
  AVITO: "Авито",
  DM: "ЛС",
  CONTACT: "Написать в ЛС",
  CANCEL: "Отмена",
  DELETE: "Удалить",
  DELETE_CONFIRM: "Удалить безвозвратно",
  MARK_OUT: "Снять с продажи",
  MARK_IN: "Вернуть в продажу",
  PREV: "«",
  NEXT: "»",
});

export const Texts = {
  welcome: () =>
    `<b>${store()}</b>\n` +
    `Авторский ресейл-магазин.\n\n` +
    `Здесь — вещи с проверенным качеством. Откройте «Каталог», чтобы посмотреть актуальные позиции, ` +
    `или загляните в «Профиль».\n\n` +
    `Навигация — кнопками ниже.`,

  catalogHeader: (total) =>
    `<b>Каталог</b>\n` +
    `Доступно позиций: ${total}\n\n` +
    `Выберите вещь, чтобы посмотреть фото, описание и цену.`,

  catalogEmpty: (isAdmin) =>
    `<b>Каталог</b>\n` +
    `Пока нет позиций. Загляните чуть позже.` +
    (isAdmin ? `\n\nДобавить товар: /sell` : ``),

  itemCaption: (product) =>
    `<b>${escapeHtml(product.name)}</b>\n\n` +
    `${escapeHtml(product.description)}\n\n` +
    `Цена: <b>${escapeHtml(product.price)}</b>\n` +
    `Статус: ${product.inStock ? "в наличии" : "нет в наличии"}`,

  profile: (user) => {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
    const name = escapeHtml(fullName || "Гость");
    const username = user?.username ? `@${escapeHtml(user.username)}` : "—";
    return (
      `<b>Профиль</b>\n\n` +
      `Имя: ${name}\n` +
      `Username: ${username}\n` +
      `ID: <code>${user?.id ?? "—"}</code>\n\n` +
      `Магазин: <b>${store()}</b>\n` +
      `По вопросам покупки и доставки — кнопка ниже.`
    );
  },

  adminEnabled: () =>
    `Режим администратора включён.\n` +
    `Добавить товар: /sell\n` +
    `Отменить добавление: /cancel`,

  sellAskPhoto: () => `Добавление товара.\n\nШаг 1 из 5. Пришлите <b>фото</b> вещи.`,
  sellAskName: () => `Шаг 2 из 5. Пришлите <b>название</b>.`,
  sellAskDescription: () => `Шаг 3 из 5. Пришлите <b>описание</b>.`,
  sellAskPrice: () => `Шаг 4 из 5. Укажите <b>цену</b> (например: «5 000 ₽» или «договорная»).`,
  sellAskAvito: () => `Шаг 5 из 5. Пришлите <b>ссылку на Авито</b> (https://...).`,
  sellNeedPhoto: () => `Нужно именно фото. Пришлите изображение вещи.`,
  sellNeedText: () => `Нужен текст. Повторите ввод.`,
  sellBadUrl: () => `Это не похоже на ссылку. Пришлите корректный URL (https://...).`,
  sellTooLong: (max) => `Слишком длинно (максимум ${max} символов). Повторите ввод.`,
  sellSaved: (name) => `Готово. «${escapeHtml(name)}» добавлен в каталог.`,
  sellCancelled: () => `Добавление отменено.`,
  sellError: () => `Не удалось сохранить товар. Попробуйте снова: /sell`,

  genericError: () => `Произошла ошибка. Попробуйте ещё раз чуть позже.`,
};
