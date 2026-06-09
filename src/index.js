// Точка входа: подключение БД, инициализация бота, выбор режима (webhook/polling), корректное завершение.
import express from "express";
import { Bot, webhookCallback } from "grammy";
import { config } from "./config.js";
import { connectDatabase, disconnectDatabase } from "./db/connect.js";
import { adminService } from "./services/admin.service.js";
import { registerHandlers } from "./handlers/register.js";
import { logger } from "./utils/logger.js";

async function bootstrap() {
  await connectDatabase();
  await adminService.init();

  const bot = new Bot(config.botToken);
  registerHandlers(bot);

  await bot.init();
  await bot.api.setMyCommands([{ command: "start", description: "Открыть магазин" }]);
  logger.info(`Бот авторизован как @${bot.botInfo.username}`);

  if (config.useWebhook) {
    await startWebhook(bot);
  } else {
    await startPolling(bot);
  }

  setupGracefulShutdown(bot);
}

async function startWebhook(bot) {
  const app = express();
  app.use(express.json());

  const path = `/tg/${config.webhookSecret}`;
  app.post(path, webhookCallback(bot, "express", { secretToken: config.webhookSecret }));
  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
  app.get("/", (_req, res) => res.status(200).send("mP2Pstore bot is running"));

  await new Promise((resolve) => app.listen(config.port, resolve));
  logger.info(`HTTP-сервер слушает порт ${config.port}`);

  await bot.api.setWebhook(`${config.publicUrl}${path}`, {
    secret_token: config.webhookSecret,
    drop_pending_updates: true,
    allowed_updates: ["message", "callback_query"],
  });
  logger.info(`Webhook установлен на ${config.publicUrl}${path}`);
}

async function startPolling(bot) {
  await bot.api.deleteWebhook({ drop_pending_updates: true });
  bot.start({
    allowed_updates: ["message", "callback_query"],
    onStart: () => logger.info("Long polling запущен"),
  });
}

function setupGracefulShutdown(bot) {
  const shutdown = async (signal) => {
    logger.info(`Получен сигнал ${signal}. Завершение работы...`);
    try {
      if (!config.useWebhook) {
        await bot.stop();
      }
      await disconnectDatabase();
    } catch (err) {
      logger.error("Ошибка при завершении:", err.message);
    } finally {
      process.exit(0);
    }
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  logger.error("Критическая ошибка при запуске:", err);
  process.exit(1);
});
