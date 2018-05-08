<template>
  <div>
    <!--<app-quickview></app-quickview>-->
    <app-settings></app-settings>
    <app-search></app-search>
    <app-aside></app-aside>
    <div class="app-content">
      <app-header></app-header>
      <div class="layer-loading" v-show="loading"><i></i><i></i><i></i></div>
      <transition name="scale" mode="out-in" appear>
        <router-view class="app-content-view" @loaded="loaded"></router-view>
      </transition>
      <div class="app-footer">
        <small>©daoos</small>
        <span class="float-right">
          <small>1.0</small>
          <a href><i class="fa fa-long-arrow-up"></i></a>
        </span>
      </div>
    </div>
    <div id="toast-container" class="toast-bottom-left"></div>
  </div>
</template>

<script>
import AppQuickview from './partials/app.quickview.vue'
import AppSettings from './partials/app.settings.vue'
import AppSearch from './partials/app.search.vue'
import AppHeader from './partials/app.header.vue'
import AppAside from './partials/app.aside.vue'
import { Auth } from '../resources'

export default {
  components: {AppHeader, AppAside, AppSearch, AppSettings, AppQuickview},
  name: 'index',
  data: () => ({
    transitionName: 'slide-left',
    loading: 1
  }),
  beforeRouteEnter: Auth.authorizations, // 进入首页前先进行登录验证
  beforeRouteUpdate (to, from, next) {
    this.loading = 1  // 路由变化时显示加载动画
    next()
  },
  methods: {
    loaded (state) { // 子组件加载完成应向上触发`loaded`事件, 在这里捕获后隐藏加载动画. (有没有更好的实现办法?)
      this.loading = state
    }
  }
}
</script>
