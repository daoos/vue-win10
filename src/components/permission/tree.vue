<!--
  权限树形列表
-->
<script>
import { keyForPermissionTreeState } from '../../constants'
import { toggleNode } from '../../misc/utils'

// 这里的代码只会调用一次，切换样式一/样式二时会不同步，各自有独立的状态，这里不做处理，因为通常只会使用一种样式
var stored = localStorage.getItem(keyForPermissionTreeState)  // get stored expanded nodes
var expanded = stored ? JSON.parse(stored) : {}

export default {
  name: 'PermissionTree',
  props: ['treenodes'],
  render (h) {
    var that = this

    function contents (node) {
      // 是否为父节点
      var parent = node.children && node.children.length
      var sub = []
      // 展开指示
      if (parent) {
        sub.push(h('span', {class: 'indicator'}))
      }
      // 图标
      if (node.icon) {
        sub.push(h('i', {class: node.icon}))
      }
      // 名称
      sub.push(h('span', {class: 'mr-auto', domProps: {innerHTML: node.name}}))
      sub.push(h('span', {class: 'column', domProps: {innerHTML: node.code}}))
      sub.push(h('span', {class: 'column', domProps: {innerHTML: node.priority}}))
      sub.push(h('span', {class: 'column invisible'}, [
        h('a', {
          class: 'text-primary pointer',
          on: {
            click (e) {
              e.stopPropagation()
              that.$emit('action', 'edit', node)
            }
          },
          domProps: {innerHTML: '编辑'}
        }),
        h('a', {
          class: 'text-danger pointer ml-2',
          on: {
            click (e) {
              e.stopPropagation()
              that.$emit('action', 'del', node, expanded)
            }
          },
          domProps: {innerHTML: '删除'}
        })
      ]))
      var arr = [h('span', {
        class: 'treeitem visible',
        on: {
          click (e) {
            toggleNode(e, node, expanded)
          }
        }
      }, sub)]
      // 如果节点包含子节点, 生成子节点列表
      if (parent) {
        arr.push(h('ul', node.children.map(contents)))
      }
      return h('li', {class: {parent, open: expanded[node.id]}}, arr)
    }

    return h('ul', {class: 'treelist'}, this.treenodes.map(contents))
  },
  destroyed () {
    localStorage.setItem(keyForPermissionTreeState, JSON.stringify(expanded))
  }
}
</script>
