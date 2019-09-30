
import Vue from 'vue';
import axios from 'axios';
import App from './App.vue';
import moment from 'moment';
import md5 from 'crypto-js/md5';
import VueCookies from 'vue-cookies';

Vue.config.productionTip = false;

Vue.use(VueCookies);

Vue.prototype.axios = axios.create({
    baseURL: 'http://' + process.env.VUE_APP_API,
    timeout: 1000,
});

Vue.filter('dateFormat', value => {
    return moment(value).fromNow();
});

Vue.filter('gravatarPicture', (value, size) => {
    return 'https://www.gravatar.com/avatar/' + md5(value) + '?s=' + size;
});

new Vue({
    render: h => h(App),
}).$mount('#app');
