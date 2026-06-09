// Кладёт в контекст флаг ctx.state.isAdmin (проверка по in-memory кэшу — без запроса в БД).
import { adminService } from "../services/admin.service.js";

export async function attachAdmin(ctx, next) {
  ctx.state = ctx.state ?? {};
  ctx.state.isAdmin = adminService.isAdmin(ctx.from?.id);
  await next();
}
