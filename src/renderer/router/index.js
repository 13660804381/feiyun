import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: require('@/page/home/home').default,
      meta: {
        type: '',
        login: true
      }
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/page/login/login').default,
      meta: {
        type: 'login'
      }
    }
  ]
})
