export default defineEventHandler(async () => {
    await new Promise((r) => setTimeout(r, 1500))
    return { slow: true, ts: Date.now() }
})