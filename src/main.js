import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import store from './store'
import '@mdi/font/css/materialdesignicons.css'
import axios from 'axios'

const app = createApp(App);

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if(token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    error => {
        return Promise.reject(error);
    }
)

axios.interceptors.response.use(
    response => response,
    async error => {
        if(error.response && error.response.status === 401 ) {
            try{
                const refreshToken = localStorage.getItem('refreshToken')
                localStorage.removeItem('token')
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/user/refresh-token`, {refreshToken})
                console.log(response)
                const token = response.data.result.token;
                localStorage.setItem('token', token)
                window.location.reload()
            } catch(e) {
                localStorage.clear()
                window.location.href = "/user/login"
            }
        }
        return Promise.reject(error)
    }
)

app.use(vuetify)
app.use(router)
app.use(store)
app.mount('#app')