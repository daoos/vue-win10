<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item active">部门管理</li>
    </ol>
    <div class="card mx-3">
      <div class="p-3">
        <div class="text-muted mb-3">系统部门树</div>
        <router-link to="/department/new" class="float-right"><span class="img-btn">┼</span> 新增部门</router-link>
      </div>

      <div class="row no-gutters text-muted mx-3" style="padding: .5rem .625rem">
        <span class="mr-auto">权限名</span>
        <span class="column d-none d-md-block">负责人</span>
        <span class="column d-none d-xl-block">创建时间</span>
        <span class="column">操作</span>
      </div>
      <tree class="px-3" :treenodes="treenodes"></tree>
    </div>
  </div>
</template>
<script>
import { deleteConfirm, toggleNode, removeNodeInTree } from '../../misc/utils'
import { keyForDepartmentTreeState } from '../../constants'
import { Department } from '../../resources'

var stored = localStorage.getItem(keyForDepartmentTreeState)  // get stored expanded nodes
var expanded = stored ? JSON.parse(stored) : {}

export default {
  name: 'Departments',
  data: () => ({
    loading: false,
    treenodes: []
  }),
  beforeRouteEnter (to, from, next) {
    Department.tree().then(response => {
      next(vm => {
        vm.treenodes = response.data
        vm.$nextTick(() => {
          vm.$emit('loaded')
        })
      })
    })
  },
  destroyed () {
    localStorage.setItem(keyForDepartmentTreeState, JSON.stringify(expanded))
  },
  components: {
    tree: {
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
          sub.push(h('span', {class: 'column d-none d-md-block', domProps: {innerHTML: node.leaderName}}))
          sub.push(h('span', {class: 'column d-none d-xl-block', domProps: {innerHTML: node.created}}))
          sub.push(h('span', {class: 'column invisible'}, [
            h('a', {
              class: 'text-primary pointer',
              on: {
                click (e) {
                  that.$parent.$router.push('/department/' + node.id)
                  e.stopPropagation()
                }
              },
              domProps: {innerHTML: '编辑'}
            }),
            h('a', {
              class: 'text-danger pointer ml-2',
              on: {
                click (e) {
                  deleteConfirm(Department.delete.bind(this, node.id), removeNodeInTree.bind(null, that.treenodes, node.id))
                  e.stopPropagation()
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
        localStorage.setItem(keyForDepartmentTreeState, JSON.stringify(expanded))
      }
    }
  }
}
</script>
