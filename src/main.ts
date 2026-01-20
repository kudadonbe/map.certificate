import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize authentication before mounting app
// This ensures auth state is loaded before first render
const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
  app.mount('#app')
})
