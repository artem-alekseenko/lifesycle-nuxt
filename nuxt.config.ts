// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
      enabled: true,

      timeline: {
        enabled: true,
      },
    },
    ssr: true,
    routeRules: {
        '/spa/**': { ssr: false }, // пример SPA‑островка (чистый CSR)
    },
    modules: [
        './modules/lifecycle-demo'
    ],
    lifecycleDemo: {
        enabled: true,
        logLevel: 'info'
    },
})