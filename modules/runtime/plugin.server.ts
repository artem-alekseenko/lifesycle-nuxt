export default defineNuxtPlugin((nuxtApp) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟣 [M-RT-S] MODULE RUNTIME PLUGIN (SERVER) — Инициализация серверного runtime-плагина
   💡 Всё, что должно жить на запросах/в браузере
   💡 Добавлен модулем lifecycle-demo в хуке ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    const config = useRuntimeConfig()
    
    // Пример: инициализация серверных утилит
    if (import.meta.server) {
        console.log('   📦 Runtime config:', config.public.lifecycleDemo)
    }
})

