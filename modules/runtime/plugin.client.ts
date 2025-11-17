export default defineNuxtPlugin((nuxtApp) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟣 [M-RT-C] MODULE RUNTIME PLUGIN (CLIENT) — Инициализация клиентского runtime-плагина
   💡 Всё, что должно жить на запросах/в браузере
   💡 Добавлен модулем lifecycle-demo в хуке ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

    const config = useRuntimeConfig()
    
    // Пример: инициализация клиентской библиотеки
    if (import.meta.client) {
        console.log('   📦 Runtime config:', config.public.lifecycleDemo)
    }
})

