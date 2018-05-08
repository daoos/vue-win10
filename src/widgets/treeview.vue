<!--
  树形视图, 目前用于角色的权限展示 (是否还有其它用途?)
-->
<script>
/* 展开/收缩子元素 */
function toggle (e) {
  e.currentTarget.parentNode.classList.toggle('open')
}

export default {
  name: 'treeview',
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
    var that = this

    function checkbox (node, parent) {
      var index = that.checked.indexOf(node.id)
      var checked = index > -1
      var arr = []
      arr.push(h('input', {
        attrs: {type: 'checkbox', name: 'items', value: node.id, checked},
        on: {
          change (e) {
            if (checked) {
              that.checked.splice(index, 1)
            } else {
              that.checked.push(node.id)
            }
            that.checkAncestors(node, !checked)
            that.checkChildren(node, !checked)
            e.preventDefault()
          }
        }
      }))
      arr.push(h('i', {'class': 'bg-warning ml-1'}))
      if (parent) {
        arr.push(h('span', {'class': 'link font-xs mx-1', domProps: {innerHTML: '全部'}}))
      } else {
        arr.push(h('em', {'class': node.icon}))
        arr.push(that._v(node.name))
      }
      return h('label', {class: 'md-check'}, arr)
    }

    function contents (node) {
      that.map[node.id] = node       // 以id为key保存所有节点
      var parent = node.children
      var arr = []
      if (parent) {
        arr.push(h('span', {'class': 'treeitem', attrs: {title: '展开/折叠'}, on: {click: toggle}}, [
          h('i', {'class': node.icon}),
          h('span', {domProps: {innerHTML: node.name}})
        ]))
        arr.push(checkbox(node, parent))
        arr.push(h('ul', node.children.map(contents)))
        return h('li', {class: 'parent open'}, arr)
      } else {
        arr.push(h('span', {'class': 'treeitem'}, [checkbox(node, parent)]))
        return h('li', {class: ''}, arr)
      }
    }

    return h('ul', {class: 'treeview row'}, this.treenodes.map(contents))
  }
}
</script>
<style lang="scss">

  .treeview {
    list-style: none;
    padding-left: 1rem;
    > ul {
      > li:after,
      > li:before { border: 0 }
    }
    ul {
      padding-left: 34px; padding-top: 10px; list-style: none;
      li:hover { background: rgba(0, 0, 0, .015) }
    }
    > li:before,
    > li:after { display: none !important }
    li {
      padding: 5px; position: relative;
      &:after,
      &:before { position: absolute; content: ''; left: -16px }
      &:before { border-left: 1px solid #ccc; height: 100%; bottom: 50px; top: -10px; width: 1px }
      &:after { border-top: 1px solid #ccc; height: 20px; top: 20px; width: 22px }
      &:last-child::before { height: 30px }
    }
    li::before,
    li::after,
    .treeitem {
      transition: color, border-color, background-color, .25s ease
    }
    .treeitem {
      display: inline-block; align-items: center; white-space: nowrap; border: 1px dotted #999; border-radius: 3px; padding: 3px 8px; cursor: pointer;
      &:hover { background: #eee; border-color: #94A0B4; color: #222 }
      &:hover { background-color: #DF8505; border-color: #C67605; color: #fff }
      &:hover ~ ul li::before,
      &:hover ~ ul li::after { border-color: #F89406 }
      &:hover ~ ul .treeitem { background: #FDDFB3; border-color: #FAA937; color: #222 }
      & > i,
      & em { text-align: center; min-width: 18px; }
    }
    .parent {
      > ul { display: none }
      &.open > ul { display: block }
      > .treeitem::before { font-family: FontAwesome; content: '\F055'; display: inline-block; text-align: center; padding: 0 7px 0 3px }
      &.open > .treeitem:before { content: '\f056' }
    }
  }

</style>
