// Загрузка и валидация переменных окружения. Единый источник конфигурации.
import "dotenv/config";
import crypto from "node:crypto";

function required(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    console.error(`[config] Не задана обязательная переменная окружения: ${name}`);
    process.exit(1);
  }
  return value.trim();
}

function parseAdminIds(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
}

function parsePositiveInt(raw, fallback) {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

const botToken = required("BOT_TOKEN");
const mongoUri = required("MONGODB_URI");

// Публичный адрес: явный PUBLIC_URL или авто-URL, который выдаёт Render
const publicUrl = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || "")
  .trim()
  .replace(/\/+$/, "");

// Секрет webhook: задаётся вручную либо стабильно вычисляется из токена
const webhookSecret =
  (process.env.WEBHOOK_SECRET || "").trim() ||
  crypto.createHash("sha256").update(botToken).digest("hex").slice(0, 32);

export const config = Object.freeze({
  botToken,
  mongoUri,
  adminSecret: (process.env.ADMIN_SECRET || "/Admin7788").trim(),
  adminIds: parseAdminIds(process.env.ADMIN_IDS),
  contactUsername: (process.env.CONTACT_USERNAME || "msgp2p").trim().replace(/^@/, ""),
  storeName: (process.env.STORE_NAME || "mP2Pstore").trim(),
  pageSize: parsePositiveInt(process.env.PAGE_SIZE, 8),
  port: parsePositiveInt(process.env.PORT, 3000),
  publicUrl,
  webhookSecret,
  useWebhook: Boolean(publicUrl),
});

export const contactUrl = `https://t.me/${config.contactUsername}`;
