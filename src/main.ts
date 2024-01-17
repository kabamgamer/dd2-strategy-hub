import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(vue3GoogleLogin, {
    clientId: '1070797784427-26gm69um5oc2b3bv5j9fluuqspa8u2oh.apps.googleusercontent.com'
})

app.mount('#app')
