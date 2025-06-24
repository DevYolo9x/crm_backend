import { createApp } from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'
import './index.css'
import 'vue-multiselect/dist/vue-multiselect.css'
createApp(App).use(store).use(router).mount('#app')
