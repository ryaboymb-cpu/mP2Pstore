// Сессия (в памяти): хранит активное меню, текущую страницу каталога и состояние /sell.
import { session } from "grammy";

function getSessionKey(ctx) {
  const id = ctx.chat?.id ?? ctx.from?.id;
  return id === undefined ? undefined : String(id);
}

export function createSession() {
  return session({
    getSessionKey,
    initial: () => ({
      menuMessageId: undefined,
      menuType: undefined, // 'text' | 'photo'
      catalogPage: 0,
      sell: null,
    }),
  });
}
