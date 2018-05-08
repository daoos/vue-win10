<template>
  <div class="app-settings d-none d-md-block">
    <button class="btn" @click="toggle"><i class="fa fa-gear fa-spin"></i></button>
    <div class="py-2 bb-l">设置</div>
    <div class="py-1 px-3 bg-light">菜单</div>
    <section class="pl-3">
      <div class="d-flex align-items-center bb-eee py-1 pr-3">折叠/展开菜单
        <label class="ui-switch ui-switch-sm ml-auto">
          <input type="checkbox" name="asideFolded" v-model="layout" value="aside-folded" @change="change"><i></i>
        </label>
      </div>
      <div class="d-flex align-items-center bb-eee py-1 pr-3">指向展开菜单
        <label class="ui-switch ui-switch-sm ml-auto">
          <input type="checkbox" name="asideHover" v-model="layout" value="aside-hover" @change="change"><i></i>
        </label>
      </div>
      <div class="d-flex align-items-center bb-eee py-1 pr-3">
        <span>固定菜单</span>
        <label class="ui-switch ui-switch-sm ml-auto">
          <input type="checkbox" name="asideFixed" v-model="layout" value="aside-fixed" @change="change"><i></i>
        </label>
      </div>
    </section>
    <div class="py-1 px-3 bg-light">其它</div>
    <section class="pl-3">
      <div class="d-flex align-items-center bb-eee py-1 pr-3">固定宽度布局
        <label class="ui-switch ui-switch-sm ml-auto">
          <input type="checkbox" name="layoutBoxed" v-model="layout" value="layout-boxed" @change="change"><i></i>
        </label>
      </div>
      <div class="d-flex align-items-center bb-eee py-1 pr-3">固定页头
        <label class="ui-switch ui-switch-sm ml-auto">
          <input type="checkbox" name="headerFixed" v-model="layout" value="header-fixed" @change="change"><i></i>
        </label>
      </div>
      <div class="d-flex align-items-center bb-eee py-1 pr-3">固定页脚
        <label class="ui-switch ui-switch-sm ml-auto">
          <input type="checkbox" name="footerFixed" v-model="layout" value="footer-fixed" @change="change"><i></i>
        </label>
      </div>
    </section>
    <div class="row no-gutters px-2 mt-2 theme-switcher">
      <div class="col-6 px-1">
        <label class="bg-themedark" :class="{'active': theme == 'dark'}" title="Dark" @click="active"><i class="fa fa-check"></i></label>
      </div>
      <div class="col-6 px-1 mb-1">
        <label class="bg-themewhite" :class="{'active': theme == 'white'}" title="White" @click="active"><i class="fa fa-check"></i></label>
      </div>
      <div class="col-6 px-1">
        <label class="bg-themeblue" :class="{'active': theme == 'blue'}" title="Blue" @click="active"><i class="fa fa-check"></i></label>
      </div>
      <div class="col-6 px-1">
        <label class="bg-themebrown" :class="{'active': theme == 'brown'}" title="Brown" @click="active"><i class="fa fa-check"></i></label>
      </div>
    </div>

    <div class="text-center my-3">
      <button class="btn btn-sm btn-outline-secondary rad-15" @click="reset">恢复默认设置</button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'appSettings',
  data: () => ({
    layout: ['header-fixed'],
    theme: localStorage.theme || 'dark'
  }),
  created () {
    // 非默认主题, 则进行切换
    if (this.theme) {
      document.getElementById('app-theme').setAttribute('href', `/static/css/theme-${this.theme}.css`)
    } else {
      document.getElementById('app-theme').removeAttribute('href')
    }
    var stored = localStorage.getItem('layout')
    if (stored) {
      this.layout = JSON.parse(stored)
    }
    document.body.className = this.layout.join(' ')
  },
  methods: {
    // 切换主题颜色
    active (e, theme) {
      // 获取选中主题, 优先使用参数传递的主题
      theme = theme || e.target.title.toLowerCase()
      // 更改样式链接
      document.getElementById('app-theme').setAttribute('href', `/static/css/theme-${theme}.css`)
      // 保存
      localStorage.setItem('theme', theme)
      this.theme = theme
    },
    // 切换布局
    change (e) {
      var value = e.target.value
      if (value === 'aside-hover') {
        var fixed = this.layout.indexOf('aside-fixed')
        console.log(fixed)
      }
      // 切换选中样式
      document.body.classList.toggle(value)
      // 保存布局
      localStorage.setItem('layout', JSON.stringify(this.layout))
    },
    reset () {
      // active default theme
      this.active(null, 'blue')
      // remove all layout classes
      var layous = ['layout-boxed', 'footer-fixed', 'aside-folded', 'aside-hover', 'aside-fixed']
      layous.forEach(l => {
        document.body.classList.remove(l)
      })
      document.body.classList.add('header-fixed')
      // change and store current layout
      this.layout = ['header-fixed']
      localStorage.setItem('layout', JSON.stringify(this.layout))
    },
    toggle () {
      this.$el.classList.toggle('show')
    }
  }
}
</script>

<style>
  .app-settings {
    box-shadow: -1px 1px 1px rgba(0, 0, 0, .15);
    transition: right .3s ease-in-out;
    background: #fff;
    position: fixed;
    z-index: 15;
    width: 200px;
    right: -200px;
    top: 3.25rem;
  }
  .app-settings > .btn {
    box-shadow: -1px 1px 1px rgba(0, 0, 0, .15);
    border-radius: 3px 0 0 3px;
    padding: 7px 15px;
    position: absolute;
    background: #fff;
    left: -45px;
  }
  .app-settings.show { right: 0 }
  .theme-switcher label { text-align: center; display: block }
  .theme-switcher i { visibility: hidden; line-height: 31px; color: #007aff }
  .theme-switcher .active i { visibility: visible }
</style>
