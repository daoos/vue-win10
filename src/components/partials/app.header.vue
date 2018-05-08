<template>
  <nav class="app-header navbar navbar-toggleable-sm">

    <a class="nav-item d-md-none" title="拉出菜单" @click="pushAside" href><i class="fa fa-bars"></i></a>
    <a class="nav-item d-none d-md-block" title="展开菜单" @click="toggleAside" href><i class="fa fa-bars"></i></a>

    <div class="dropdown static">
      <a class="nav-item" v-ripple href>菜单</a>
      <div class="dropdown-menu w-100 m-0 p-3">
        <div class="row">
          <div class="col-2 text-center">
            <img :src="user.avatar" class="rounded-circle thumb-lg">
            <div class="h4 m-0">{{user.name}}</div>
            <small class="badge badge-secondary">{{user.roleName}}</small>
          </div>
          <div class="col-3">
            <div class="font-weight-bold">系统工具 <span class="badge badge-pill badge-primary">12</span></div>
            <div class="row">
              <div class="col-md-4">
                <div><a @click.prevent="request('reload-config')" href><i class="fa fa-angle-right"></i>重载配置</a></div>
                <div><a @click.prevent="request('clean-cache')" href><i class="fa fa-angle-right"></i>清空缓存</a></div>
                <div>
                  <router-link to="/html/ui.tabs.html"><i class="fa fa-angle-right"></i>Tabs</router-link>
                </div>
              </div>
              <div class="col-md-8">
                <div>
                  <router-link to="/html/ui.buttons.html"><i class="fa fa-angle-right"></i>Buttons</router-link>
                </div>
                <div>
                  <router-link to="/html/ui.font-awesome-icons.html"><i class="fa fa-angle-right"></i>FontAwesome Icons <span class="badge badge-pill badge-warning">500+</span>
                  </router-link>
                </div>
                <div>
                  <router-link to="/html/ui.themify-icons.html"><i class="fa fa-angle-right"></i>Themify Icons <span class="badge badge-pill badge-warning">300+</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a class="nav-item" title="打开搜索" @click="toggleSearch" v-ripple href><i class="ti-search"></i></a>
    <a class="nav-item" title="刷新" @click="refresh" v-ripple href><i class="ti-reload"></i></a>
    <div class="dropdown ml-auto">
    </div>

    <div class="dropdown">
      <a class="nav-item pointer" dropdown-toggle>
        <span class="d-inline-block relative">
          <img :src="user.avatar" class="rounded-circle avatar">
          <i class="network on bottom"></i>
        </span>
        <span class="d-none d-md-inline-block ml-1">{{user.name}} <i class="fa fa-angle-down text-primary"></i></span>
      </a>
      <div class="dropdown-menu dropdown-menu-right pt-0 m-0">
        <div class="bg-light bb-eee mb-2 p-3">
          <div class="mb-2">资料完整度100%</div>
          <div class="progress-bar progress-xs w-100"></div>
        </div>
        <router-link class="dropdown-item py-2" to="/user/profile"><i class="fa fa-edit"></i> 个人资料</router-link>
        <div class="dropdown-item py-2" @click="toggleSettings">
          <i class="fa fa-cog"></i> 设置<span class="badge badge-pill badge-secondary mt-1 float-right">new</span>
        </div>
        <div class="dropdown-divider"></div>
        <router-link class="dropdown-item py-2" to="/logout"><i class="fa fa-sign-out"></i> 退出登录</router-link>
      </div>
    </div>

    <a class="nav-item" @click="toggleQuickview" title="打开右边栏" v-ripple href>
      <i class="fa fa-ellipsis-v"></i>
    </a>
  </nav>

</template>

<script>
import {Auth, http} from '../../resources'

function hander (e) {
  var left = e.pageX || e.clientX
  if (left > 220) {
    document.body.classList.remove('aside-pushed')
    document.querySelector('#app').removeEventListener('click', hander, true)
  }
}

export default {
  data: () => ({
    user: Auth.currentUser
  }),
  methods: {
    toggleQuickview: () => document.querySelector('.app-quickview').classList.toggle('app-quickview-show'),
    toggleSettings: () => document.querySelector('.app-settings').classList.toggle('app-settings-show'),
    toggleSearch: () => document.querySelector('.app-search').classList.toggle('app-search-show'),
    toggleAside: () => document.body.classList.toggle('aside-folded'),
    pushAside () {
      var pushed = document.body.className.indexOf('aside-pushed')
      if (pushed === -1) {
        document.querySelector('#app').addEventListener('click', hander)
        document.body.classList.add('aside-pushed')
      } else {
        document.querySelector('#app').removeEventListener('click', hander)
        document.body.classList.remove('aside-pushed')
      }
    },
    request (url) {
      http.delete(url).then(response => {
        this.$notice[response.data.success ? 'success' : 'error'](response.data.msg)
      })
    }
  }
}
</script>

<style lang="scss">

</style>
