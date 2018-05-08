<!--
  树形列表, 目前用于权限树展示 (是否还有其它用途?)
-->
<script>
/* 展开/收缩子元素 */
function toggle (e) {
  e.currentTarget.parentNode.classList.toggle('open')
}

export default {
  name: 'treelist',
  props: {
    treenodes: Array,
    checked: {type: Array, 'default': () => []}
  },
  data: () => ({
    map: {}
  }),
  methods: {
    checkAncestors (node, checked) {
      var parent = this.map[node.parent]
      if (parent) {
        if (checked) {
          var all = parent.children.every(n => n.id == node.id || this.checked.includes(n.id))
          if (all) {
            this.checked.push(parent.id)
          }
        } else {
          var index = this.checked.indexOf(node.id)
          this.checked.splice(index, 1)
        }
        this.checkAncestors(parent, checked)
      }
    },
    checkChildren (node, checked) {
      node.children && node.children.forEach(n => {
        var index = this.checked.indexOf(n.id)
        if (checked) {
          if (index < 0) {
            this.checked.push(n.id)
          }
        } else {
          if (index > -1) {
            this.checked.splice(index, 1)
          }
        }
        this.checkChildren(n, checked)
      })
    }
  },
  render (h) {
    var v = this

    // 渲染复选框
    function _checkbox (/* 节点对象 */ node, /* 额外样式 */ style, /* 选项文本 */ text) {
      var index = v.checked.indexOf(node.id)
      var checked = index > -1
      var sub = [
        h('input', {
          domProps: {type: 'checkbox', name: 'items', value: node.id, checked},
          on: {
            change (e) {
              if (checked) {
                v.checked.splice(index, 1)
              } else {
                v.checked.push(node.id)
              }
              v.checkAncestors(node, !checked)
              v.checkChildren(node, !checked)
              e.preventDefault()
            }
          }
        }),
        h('i', {'class': 'bg-themedark'})
      ]
      if (text) {
        sub.push(v._v(text))
      }
      return h('label', {'class': ['md-check', style]}, sub)
    }

    // 渲染节点元素
    function contents (node) {
      v.map[node.id] = node       // 以id为key保存所有节点
      var parent = node.children  // 是否为父节点
      var sub = []                // 子元素数组

      if (parent) {
        sub.push(h('span', {'class': 'indicator'})) // 展开指示
      } else {
        sub.push(_checkbox(node, 'mr-1'))           // 复选框
      }
      // 图标
      if (node.icon) {
        sub.push(h('i', {'class': node.icon}))
      }
      // 名称
      sub.push(h('span', {domProps: {innerHTML: node.name}}))
      // 全选
      if (parent) {
        sub.push(_checkbox(node, 'ml-auto', ' 全部'))
      }
      //
      var arr = [h(parent ? 'span' : 'label', {'class': 'treeitem', on: {click: toggle}}, sub)]
      // 如果节点包含子节点, 生成子节点列表
      if (parent) {
        arr.push(h('ul', node.children.map(contents)))
      }
      return h('li', {
        'class': [parent ? 'parent' : ''],
        attrs: {role: node.parent == 0 ? 'root' : 'node'}
      }, arr)
    }

    return h('ul', {'class': 'treelist'}, this.treenodes.map(contents))
  }
}
</script>
