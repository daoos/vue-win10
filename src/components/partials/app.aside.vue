<template>
  <div class="app-aside">
    <router-link class="navbar-brand"  to="/">
      <img src="../../assets/img/logos/logo-xs.png" class="logo-xs">
      <img src="../../assets/img/logos/logo-sm.png" class="logo-sm">
      <img src="../../assets/img/logos/logo.png" class="logo">
    </router-link>
    <div class="aside-title">菜单</div>
    <router-link class="aside-item" to="/" title="首页" v-ripple exact>
      <i class="fa fa-dashboard"></i><span>首页</span>
    </router-link>
    <router-link v-ripple class="aside-item" to="/permission" v-permission="'permission.view'"><i class="fa fa-unlock-alt"></i><span>系统权限</span></router-link>
    <router-link v-ripple class="aside-item" to="/roles" v-permission="'role.view'"><i class="fa fa-vcard"></i><span>系统角色</span></router-link>
    <router-link v-ripple class="aside-item" to="/users" v-permission="'user.view'"><i class="fa fa-users"></i><span>用户管理</span></router-link>
    <router-link v-ripple class="aside-item" to="/department" v-permission="'department.view'"><i class="fa fa-building-o"></i><span>部门管理</span></router-link>
    <router-link v-ripple class="aside-item" to="/dict" v-permission="'dict.view'"><i class="fa fa-book"></i><span>数据字典</span></router-link>
    <router-link v-ripple class="aside-item" to="/files" v-permission="'files'"><i class="fa fa-files-o"></i><span>文件库</span></router-link>
    <!--<div class="aside-divider"></div>-->
  </div>
</template>
<script>
import {siblings} from '../../misc/utils'

var openedClass = 'opened'

function openActiveItemAncestors (el, until) {
  var parent = el.parentNode
  if (parent == until) {
    return
  }
  if (parent.classList.contains('parent')) {
    parent.classList.add(openedClass)
  }
  openActiveItemAncestors(parent, until)
}

export default {
  name: 'AppAside',
  data: () => ({}),
  mounted () {
    var elem = this.$el
    var items = Array.from(elem.querySelectorAll('.aside-item'))
    var current = elem.querySelector('.router-link-exact-active')

    if (current) {
      openActiveItemAncestors(current, elem)
    }

    elem.addEventListener('click', function (event) {
      var el = event.target
      var sibs = siblings(el)
      items.forEach(e => {
        e.classList.remove('active')
      })
      sibs.forEach(e => {
        e.classList.remove(openedClass)
      })
      el.classList.add(openedClass)
      el.classList.add('active')
    })
  }
}
</script>

<style lang="scss">
  .app-aside {
    min-width: 220px;
    z-index: 1;
    padding-top: 41px;
    &:after {content: ' ';position: fixed;width: inherit;top: 0;bottom: 0;z-index: -1;background-color: inherit;border: inherit}
    .aside-title {padding: 6px 10px 0;font-size: .75rem;overflow: hidden;text-overflow: ellipsis;white-space: nowrap}
    .aside-divider {margin: .5rem 0;border-bottom: 1px solid #c7dcea}

    .aside-item {
      transition: background-color .1s ease-in-out 0s;
      border: 1px solid transparent;
      border-width: 1px 0 1px 0;
      text-overflow: ellipsis;
      white-space: nowrap;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      display: block;
      z-index: 15;
      &.opened {background-color: #d4e9fa}
      &.parent:after {font-family: FontAwesome;position: absolute;right: 1rem;top: 10px;content: '\F105';transition: transform .2s}
      &.parent.opened:after {transform: rotate(90deg)}
      &.opened > .children {display: block}
      span {line-height: 43px;padding-left: 50px}
      > i {position: absolute;line-height: inherit;text-align: center;border-radius: 5px;left: 10px;top: 6px;padding: 3px;width: 30px}
      > .badge {top: 2px;left: 35px;z-index: 2;min-width: 15px;min-height: 15px;opacity: .7}
    }

    .children {
      background-color: #ddeefb;margin: 0;padding: 0;display: none;
      .fold-header {display: none;line-height: 45px;padding-left: 10px;cursor: pointer}
      .aside-item {
        font-size: .9375rem;
        &:hover {background-color: #cae8fb}
        > i {background-color: transparent !important;top: 8px}
        @for $i from 1 through 15 {
          &:nth-child(#{$i}) {animation: qb #{0.1 + $i * .07}s ease-in}
        }
      }
    }
  }
</style>
