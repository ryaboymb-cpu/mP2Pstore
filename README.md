# mP2Pstore — Telegram-бот ресейл-магазина

Премиальный бот-витрина: каталог вещей с фото, описанием и ценой, кнопки «Авито» и «ЛС», скрытый режим администратора для добавления и управления товарами. Чистая архитектура: `config` / `db` / `services` / `handlers` / `keyboards` / `middlewares`.

## Возможности

- Нижние кнопки: «Каталог» и «Профиль» (без эмодзи).
- Каталог списком, карточка товара = фото + описание + цена + статус.
- Кнопки в карточке: «Назад», «Авито» (ссылка на объявление), «ЛС» (переход в личку).
- Скрытая команда входа в админку + пошаговое добавление товара (`/sell`).
- Управление прямо в карточке: «Снять с продажи / Вернуть в продажу», «Удалить» (с подтверждением).
- Автоочистка: при навигации предыдущее меню удаляется — без мусора в чате.
- Пагинация каталога, валидация ввода, защита от гонок, глобальный перехват ошибок.

## Стек

Node.js 18+, grammY, MongoDB (Mongoose), Express (webhook). Хостинг — Render (бесплатный тариф).

## Структура проекта

```
mp2pstore-bot/
├── package.json
├── .env.example
├── .gitignore
├── render.yaml
├── README.md
└── src/
    ├── index.js               # точка входа: БД, бот, webhook/polling
    ├── config.js              # переменные окружения + валидация
    ├── constants.js           # лимиты полей, шаги /sell
    ├── texts.js               # все тексты и подписи кнопок (RU)
    ├── db/
    │   ├── connect.js
    │   └── models/
    │       ├── product.model.js
    │       └── admin.model.js
    ├── keyboards/
    │   ├── reply.keyboard.js   # нижние кнопки
    │   └── inline.keyboard.js  # inline-кнопки + схема callback-данных
    ├── middlewares/
    │   ├── session.middleware.js
    │   ├── sequentialize.middleware.js
    │   └── admin.middleware.js
    ├── services/
    │   ├── product.service.js  # работа с товарами (БД)
    │   ├── admin.service.js     # права администратора
    │   └── navigation.service.js # рендер меню + автоочистка
    └── handlers/
        ├── register.js          # регистрация всех обработчиков
        ├── start.handler.js
        ├── adminAuth.handler.js
        ├── sell.handler.js
        ├── catalog.handler.js
        └── adminActions.handler.js
```

## Переменные окружения

| Переменная | Обязательна | Описание |
| --- | --- | --- |
| `BOT_TOKEN` | да | Токен от @BotFather |
| `MONGODB_URI` | да | Строка подключения MongoDB Atlas |
| `ADMIN_SECRET` | нет | Скрытая команда входа в админку (по умолчанию `/Admin7788`) |
| `ADMIN_IDS` | нет | Telegram ID админов через запятую |
| `CONTACT_USERNAME` | нет | Username для кнопки «ЛС» без `@` (по умолчанию `msgp2p`) |
| `STORE_NAME` | нет | Название магазина (по умолчанию `mP2Pstore`) |
| `PAGE_SIZE` | нет | Товаров на странице каталога (по умолчанию `8`) |
| `PUBLIC_URL` | нет | Публичный URL для webhook вне Render |
| `WEBHOOK_SECRET` | нет | Секрет webhook-пути (по умолчанию вычисляется из токена) |

`PORT` и `RENDER_EXTERNAL_URL` Render подставляет сам — задавать не нужно.

## 1. Токен бота

@BotFather → `/newbot` → задай имя и username → скопируй токен. Это `BOT_TOKEN`. Для существующего @mP2Pstore_bot можно взять токен через `/token`.

## 2. Бесплатная база MongoDB Atlas

База нужна обязательно: диск на бесплатном Render-сервисе временный, без БД товары пропадут при перезапуске. Atlas — бесплатно навсегда (тариф M0).

1. Зайди на mongodb.com/atlas → зарегистрируйся → **Create** → выбери **M0 (Free)**.
2. **Database Access** → **Add New Database User** → задай логин и пароль (запомни).
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Database** → **Connect** → **Drivers** → скопируй строку вида
   `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`.
   Подставь свой пароль вместо `PASS` и добавь имя базы перед `?`, например:
   `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/mp2pstore?retryWrites=true&w=majority`.
   Это `MONGODB_URI`.

## 3. Локальный запуск (по желанию)

1. Установи Node.js 18+.
2. `npm install`
3. Скопируй `.env.example` → `.env` и заполни `BOT_TOKEN` и `MONGODB_URI`.
4. `npm start` — локально (без `PUBLIC_URL`) бот работает в режиме long polling.

## 4. Деплой на Render

1. Залей проект на GitHub (см. раздел 5).
2. render.com → **New** → **Web Service** → подключи свой репозиторий.
3. Настройки:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Instance Type:** Free
4. **Environment** → добавь переменные: `BOT_TOKEN`, `MONGODB_URI`, `CONTACT_USERNAME` (`msgp2p`); при желании `ADMIN_SECRET`, `STORE_NAME`.
5. **Create Web Service**. После сборки бот сам пропишет webhook (использует адрес Render). Всё.

В репозитории есть `render.yaml` — можно развернуть как **Blueprint** (Render подхватит настройки автоматически).

## 5. Загрузка на GitHub

В папке проекта:

```bash
git init
git add .
git commit -m "mP2Pstore bot"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

`.env` в `.gitignore` — токен и строка БД в репозиторий не попадут.

## 6. Как пользоваться

- Любой пользователь: `/start` → кнопки «Каталог» и «Профиль».
- Ты (админ): отправь боту `/Admin7788` → затем `/sell` → пришли по очереди: **фото → название → описание → цену → ссылку на Авито**. Товар появится в каталоге.
- В карточке товара тебе видны кнопки «Снять с продажи» / «Вернуть в продажу» и «Удалить».
- Отмена добавления: `/cancel` или кнопка «Отмена».

## Нюансы бесплатного тарифа

- Free Web Service на Render «засыпает» после 15 минут без запросов — первое сообщение после простоя обрабатывается с задержкой (10–50 секунд), это нормально. Чтобы держать бота «тёплым», настрой пинг адреса `/health` через UptimeRobot или cron-job.org (раз в 5–10 минут).
- Состояние пошагового `/sell` хранится в памяти: если сервис перезапустится посреди добавления — начни `/sell` заново. Сами товары в каталоге не теряются (они в базе).
- `file_id` фото привязан к токену бота: не меняй токен после загрузки товаров, иначе старые фото перестанут открываться.
