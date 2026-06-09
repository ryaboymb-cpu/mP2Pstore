// Последовательная обработка апдейтов в рамках одного чата.
// Защищает сессию от гонок и дублей при быстрых нажатиях/параллельных webhook-запросах.
const locks = new Map();

export async function sequentialize(ctx, next) {
  const id = ctx.chat?.id ?? ctx.from?.id;
  if (id === undefined) return next();

  const previous = locks.get(id) ?? Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  const chained = previous.then(() => current);
  locks.set(id, chained);

  await previous.catch(() => {});
  try {
    await next();
  } finally {
    release();
    // Чистим Map, если за нами никто не встал в очередь (контроль памяти).
    if (locks.get(id) === chained) {
      locks.delete(id);
    }
  }
}
