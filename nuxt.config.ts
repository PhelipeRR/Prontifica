export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  app: { head: { title: 'Prontifica | Prontifica', link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }], meta: [{ name: 'description', content: 'Simule seu financiamento imobiliário com a Prontifica.' }] } },
  // A checagem pode ser executada com `npm run typecheck`; mantê-la fora do
  // servidor de desenvolvimento evita que o Nuxt dependa do vue-tsc em cada boot.
  typescript: { strict: true, typeCheck: false },
  compatibilityDate: '2024-12-01'
})
