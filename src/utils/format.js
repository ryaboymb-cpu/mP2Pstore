// Вспомогательные функции форматирования и валидации.

// Экранирование для parse_mode: HTML (защита от поломки разметки пользовательским текстом).
export function escapeHtml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// Экранирование строки для безопасного использования внутри RegExp.
export function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Проверка, что строка — валидный http(s) URL.
export function isValidHttpUrl(value = "") {
  try {
    const url = new URL(String(value).trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Обрезка длинного текста с многоточием (для подписей кнопок).
export function truncate(text = "", max = 100) {
  const value = String(text).trim();
  return value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

// Является ли ошибка Telegram «сообщение не изменено» (безопасно игнорируется).
export function isNotModified(error) {
  const description = error?.description || error?.message || "";
  return description.includes("message is not modified");
}
