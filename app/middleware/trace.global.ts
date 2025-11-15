export default defineNuxtRouteMiddleware((to, from) => {
    const side = import.meta.server ? 'SERVER' : 'CLIENT'
    console.log(`[route.global] ${side}:`, from?.fullPath ?? '(initial)', '→', to.fullPath)
})