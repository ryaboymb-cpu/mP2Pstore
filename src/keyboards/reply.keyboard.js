// Нижняя (reply) клавиатура магазина: Каталог и Профиль.
import { Keyboard } from "grammy";
import { Buttons } from "../texts.js";

export function mainKeyboard() {
  return new Keyboard()
    .text(Buttons.CATALOG)
    .text(Buttons.PROFILE)
    .resized()
    .persistent();
}
