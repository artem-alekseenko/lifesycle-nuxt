export default defineNuxtRouteMiddleware((to, from) => {
    const side = import.meta.server ? 'SERVER' : 'CLIENT'
    const fromPath = from?.fullPath ?? '(initial)'
    
    if (import.meta.server) {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 [S3] ROUTE MIDDLEWARE (SERVER) — Проверка маршрута перед SSR-рендером
   📍 Навигация: ${fromPath} → ${to.fullPath}
   💡 Проверка авторизации, локализация, канонизация URL, аналитика
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    } else {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 [C2] ROUTE MIDDLEWARE (CLIENT) — Проверка маршрута перед клиентской навигацией
   📍 Навигация: ${fromPath} → ${to.fullPath}
   💡 SPA-навигация без перезагрузки страницы
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    }
})