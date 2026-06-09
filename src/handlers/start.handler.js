// /start: приветствие и нижняя клавиатура.
import { Texts } from "../texts.js";
import { mainKeyboard } from "../keyboards/reply.keyboard.js";
import { navigation } from "../services/navigation.service.js";

export async function handleStart(ctx) {
  await navigation.clearMenu(ctx);
  ctx.session.sell = null;
  await ctx.reply(Texts.welcome(), {
    parse_mode: "HTML",
    reply_markup: mainKeyboard(),
  });
}
