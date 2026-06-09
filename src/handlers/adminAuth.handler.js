// Скрытая команда администратора (нигде не отображается в меню).
import { adminService } from "../services/admin.service.js";
import { Texts } from "../texts.js";

export async function handleAdminSecret(ctx) {
  const userId = ctx.from?.id;
  if (typeof userId !== "number") return;

  // Лучшая попытка скрыть введённую команду (в личке может не сработать — это нормально).
  try {
    await ctx.deleteMessage();
  } catch {
    // нет прав на удаление — игнорируем
  }

  await adminService.grant(userId, ctx.from?.username ?? null);

  const note = await ctx.reply(Texts.adminEnabled(), { parse_mode: "HTML" });
  // Авто-удаление уведомления через 5 секунд, чтобы не оставлять следов.
  setTimeout(() => {
    ctx.api.deleteMessage(ctx.chat.id, note.message_id).catch(() => {});
  }, 5000);
}
