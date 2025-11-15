export default defineEventHandler((event) => {
    const url = getRequestURL(event)
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 [S1] SERVER MIDDLEWARE — Обработка HTTP-запроса (Nitro/H3)
   📍 URL: ${url.pathname}
   💡 Ранняя обработка: логирование, CORS, проверка заголовков/куков
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
})