// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    experimental: {
      database: true,
      tasks: true
    },
    scheduledTasks: {
      '* * * * *': ['test']
    }
  },
  runtimeConfig: {
    db: 'sqlite.db',
    s3: {
      endpoint: '',
      region: 'us-east-1',
      bucket: '',
      accessKeyId: '',
      secretAccessKey: '',
      publicUrl: ''
    },
    oauth: {
      microsoft: {
        clientId: '',
        clientSecret: '',
        tenant: '',
      }
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/hints', '@nuxt/image', 'nuxt-auth-utils']
})