export default defineNuxtPlugin((nuxtApp) => {
    console.log('[plugin.client] app:created (client plugin)')

    nuxtApp.hook('app:beforeMount', () => {
        console.log('[hook.client] app:beforeMount — перед монтированием/гидрацией')
    })

    nuxtApp.hook('app:mounted', () => {
        console.log('[hook.client] app:mounted — после монтирования/гидрации')
    })

    // В Nuxt 4 используем useRouter() для отслеживания навигации
    const router = useRouter()
    
    router.beforeEach((to) => {
        console.log('[hook.client] page:start →', to.fullPath)
    })

    router.afterEach((to, from) => {
        const fromPath = from?.fullPath ?? '(initial)'
        console.log('[hook.client] page:finish →', `${fromPath} → ${to.fullPath}`)
    })
})
