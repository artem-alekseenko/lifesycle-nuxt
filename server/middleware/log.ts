export default defineEventHandler((event) => {
    const url = getRequestURL(event)
    console.log('[server.middleware] request', url.pathname)
})