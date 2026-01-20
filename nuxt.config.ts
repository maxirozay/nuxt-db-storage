// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    experimental: {
      database: true
    }
  },
  runtimeConfig: {
    db: 'sqlite.db',
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/hints', '@nuxt/image', 'nuxt-auth-utils']
})