import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import VueClipboard from 'vue-clipboard2'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/css/common.css'
import VueCropper from 'vue-cropper'
Vue.use(VueCropper)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.use(ElementUI)
VueClipboard.config.autoSetContainer = true // add this line
Vue.use(VueClipboard)
Vue.config.productionTip = false
//全局路由导航钩子
router.beforeEach((to, from, next) => {
  //此处获取登陆的用户信息，可以按照自己的方法获取，此处暂时用localStorage里面获取
  const token = window.localStorage.getItem('userToken')

  //判断是否存在用户信息、或者该页面是否需要登陆
  if (token || !to.meta.login) {
    //如果能获取到用户信息，说明用户已经登陆了，或者该页面不需要登陆也能进入就直接放行进入该页面
    next()
  } else {
    //否则的跳转到登陆页面，并且带上当前页面的地址，用于登陆后重新跳回来
    next({ path: './login' })
  }
})
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
