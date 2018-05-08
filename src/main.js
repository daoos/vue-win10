// // The Vue build version to load with the `import` command
// // (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import Vue from 'vue'
// import App from './App'
// import "./assets/less/tiles.less";
// import VueExtend from './Vue-extend'
// import router from './router'
// import axios from 'axios'
//
// Vue.use(VueExtend)
// Vue.config.productionTip = false
// Vue.prototype.$http = axios
// axios.defaults.baseURL = win10Config.baseUrl;
//
// /* eslint-disable no-new */
// new Vue({
//   el: '#app',
//   components: { App },
//     router,
//   template: '<App/>'
// })
import Vue from 'vue'
import VeeValidate from 'vee-validate'
import validators from './misc/validators'
import directives from './misc/directives'
import messages from './misc/validate-messages'
import filters from './misc/filters'
import toastr from './misc/toastr.esm'
import router from './routers'
import http from './resources'
import './misc/dropdown'

import VueParticles from 'vue-particles'
Vue.use(VueParticles)
// import stylesheets
import 'font-awesome/css/font-awesome.min.css'
import './assets/themify-icons/themify-icons.css'
import './assets/css/bootstrap.min.css'
import './assets/css/plugins.scss'
import './assets/css/style.scss'

// register custom validators
Object.keys(validators).forEach(v => VeeValidate.Validator.extend(v, validators[v]))

// register custom directives
Object.keys(directives).forEach(d => Vue.directive(d, directives[d]))

// register custom filters
Object.keys(filters).forEach(d => Vue.filter(d, filters[d]))

// register custom global utility functions
// Object.assign(Vue.prototype, utils)

// register global toastr as `notice`
toastr.options.newestOnTop = false
toastr.options.closeButton = true
toastr.options.extendedTimeOut = 5000 // How long the toast will display after a user hovers over it
toastr.options.timeOut = 5000 // How long the toast will display without user interaction

Vue.prototype.$notice = toastr
Vue.prototype.$http = http  // 为vue实例添加`$http`属性, 方便组件内随时调用

Vue.use(VeeValidate, {
  locale: 'zhCN',
  dictionary: {
    zhCN: {messages}  // 注册VeeValidate中文提示
  },
  classes: true,
  classNames: {
    touched: 'touched', // the control has been blurred
    untouched: 'untouched', // the control hasn't been blurred
    valid: 'is-valid', // model is valid
    invalid: 'is-invalid', // model is invalid
    pristine: 'pristine', // control has not been interacted with
    dirty: 'dirty' // control has been interacted with
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h('router-view', {attrs: {id: 'app'}}),
  router
})
