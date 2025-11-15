export default defineEventHandler(async () => {
    await new Promise((r) => setTimeout(r, 200))
    return { title: 'Nuxt Hooks Demo 2', ts: Date.now() }
})