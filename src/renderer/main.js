import Vue from 'vue'

import App from './App'

// Import style sheets
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'animate.css/animate.min.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
