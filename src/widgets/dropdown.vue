<template>
  <div class="dropdown-menu">
    <slot></slot>
  </div>
</template>

<script>
import {closest} from '../misc/utils'

var dropdown

export default {
  name: 'dropdown',
  props: ['attach', 'trigger'],
  data () {
    return {}
  },
  mounted () {
    dropdown = this.$el
    if (this.attach) {
      var attach = document.querySelector(this.attach)
      dropdown.style.marginLeft = getComputedStyle(attach.parentNode).paddingLeft
      dropdown.style.minWidth = attach.offsetWidth + 'px'
    }
    if (this.trigger) {
      document.body.addEventListener('click', this.handler) // 绑定点击事件
    }
  },
  methods: {
    handler (e) {
      var el = e.target
      var tigger = closest(el, this.attach || this.trigger) // 触发dropdown目标
      var inside = dropdown.contains(el)                    // 当前点击目标是否在dropdown之内
      console.log(inside)
      var visible = dropdown.classList.contains('show')           // dropdown是否可见
      var contains = tigger && tigger.contains(dropdown)          // 触发目标内是否有dropdown
      if (tigger) {                           // 如果点击目标是触发器
        if (visible && contains) {            // 可见并且包含dropdown
          if (inside) {                       // 点击的是dropdown内的目标，跳过
            return
          }
          dropdown.classList.remove('show')   // 隐藏
        } else {                              // 点击的是触发器但内部没有dropdown或者有dropdown但没显示
          tigger.classList.add('selectize')   // 添加dropdown需要的样式
          tigger.insertBefore(dropdown, tigger.firstChild)        // 移动dropdown到该目标
          dropdown.classList.add('show')      // 显示
        }
      } else if (visible) {                   // 点击页面其它地方
        dropdown.classList.remove('show')     // 隐藏
      }
    }
  },
  beforeDestroy () {  // 解绑事件
    document.body.removeEventListener('click', this.handler)
  }
}
</script>
