import Vue from 'vue'
import VueRouter from 'vue-router'
import { Auth } from './resources'
import axios from 'axios'

Vue.use(VueRouter)

// 专门用来展示静态HTML文件的组件
const Html = {
  data: () => ({html: ''}),
  render (h) {
    return h('div', {domProps: {innerHTML: this.html}})
  },
  beforeRouteEnter (to, from, next) {
    axios.get('/static/html/' + to.params.file).then(response => {
      next(vm => {
        vm.html = response.data
        vm.$nextTick(() => vm.$emit('loaded'))
      })
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.$emit('loaded', 1)
    axios.get('/static/html/' + to.params.file).then(response => {
      this.html = response.data
      setTimeout(() => {
        this.$emit('loaded', 0)
        next()
      }, 200)
    })
  }
}

const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "index" */ './components/index.vue'),
    children: [
      {path: '', component: () => import(/* webpackChunkName: "dashboard" */ './components/dashboard.vue')},
      {path: '/html/:file', component: Html},
      {path: '/users/:type?/:dept?', component: () => import(/* webpackChunkName: "users" */ './components/user/users.vue')},
      {path: '/user/new', component: () => import(/* webpackChunkName: "user" */ './components/user/new.vue')},
      {path: '/user/profile', component: () => import(/* webpackChunkName: "user-profile" */ './components/user/profile.vue')},
      {path: '/user/:id', component: () => import(/* webpackChunkName: "user-edit" */ './components/user/edit.vue')},
      {path: '/roles/:id?', component: () => import(/* webpackChunkName: "roles" */ './components/role/roles.vue')},
      {path: '/dict', component: () => import(/* webpackChunkName: "dict" */ './components/dict/list.vue')},
      {path: '/dict/new', component: () => import(/* webpackChunkName: "dict-new" */ './components/dict/new.vue')},
      {path: '/dict/:id', component: () => import(/* webpackChunkName: "dict-edit" */ './components/dict/edit.vue')}, // 这里的id对应`code`属性
      {path: '/permission', component: () => import(/* webpackChunkName: "permission" */ './components/permission/list.vue')},
      {path: '/permission/alt', component: () => import(/* webpackChunkName: "permissions" */ './components/permission/lists.vue')},
      {path: '/permission/new', component: () => import(/* webpackChunkName: "permission-new" */ './components/permission/new.vue')},
      {path: '/permission/:id', component: () => import(/* webpackChunkName: "permission-edit" */ './components/permission/edit.vue')},
      {path: '/department', component: () => import(/* webpackChunkName: "department" */ './components/department/list.vue')},
      {path: '/department/alt', component: () => import(/* webpackChunkName: "departments" */ './components/department/list-alt.vue')},
      {path: '/department/new', component: () => import(/* webpackChunkName: "department-new" */ './components/department/new.vue')},
      {path: '/department/:id', component: () => import(/* webpackChunkName: "department-edit" */ './components/department/edit.vue')},
      {path: '/files/:parent?', component: () => import(/* webpackChunkName: "files" */ './components/files/files.vue')}
    ]
  },
  {path: '/login', component: () => import(/* webpackChunkName: "login" */ './components/login.vue')},
  {path: '/logout', beforeEnter: Auth.logout}
]

// 不需要鉴权的路径
const permissive = ['/login', '/logout']

const router = new VueRouter({
  linkActiveClass: 'active',
  routes: routes,
  mode: 'hash',
  base: '/'
})

router.beforeEach((to, from, next) => {
  if (permissive.includes(to.path) || Auth.isLogin()) {
    return next()
  }
  // toast.info('您需要先登录.')
  next({
    path: '/login',
    query: {redirect: to.path}
  })
})

export default router
