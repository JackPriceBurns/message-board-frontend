
import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import VueCookies from 'vue-cookies';

Vue.config.productionTip = false;

Vue.use(VueCookies);

Vue.prototype.axios = axios.create({
    baseURL: process.env.VUE_APP_API,
    timeout: 1000,
});

new Vue({
    render: h => h(App),
}).$mount('#app');
