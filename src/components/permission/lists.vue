<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item active">权限管理</li>
    </ol>

    <div class="card mx-3">
      <div class="p-3">
        <div class="text-muted mb-3">系统权限列表
          <router-link to="/permission">(样式一)</router-link>
        </div>
        <router-link to="/permission/new" class="float-right"><span class="img-btn">┼</span> 新增权限</router-link>
      </div>

      <div class="row no-gutters text-muted mx-3" style="padding: .5rem .625rem">
        <span class="mr-auto">权限名</span>
        <span class="column">编码</span>
        <span class="column">优先级</span>
        <span class="column">操作</span>
      </div>
      <tree class="px-3" :treenodes="treenodes" @sort="sort" @action="action"></tree>
    </div>
  </div>
</template>
<script>
import { deleteConfirm, removeNodeInTree } from '../../misc/utils'
import { Permission } from '../../resources'
import tree from './tree.vue'

export default {
  components: {tree},
  name: 'Permissions',
  data: () => ({
    loading: false,
    treenodes: []
  }),
  beforeRouteEnter (to, from, next) {
    Permission.tree().then(response => {
      next(vm => {
        vm.treenodes = response.data
        vm.$nextTick(() => vm.$emit('loaded'))
      })
    })
  },
  methods: {
    action (type, node, expanded) {
      if (type == 'edit') {
        this.$router.push('/permission/' + node.id)
      } else {
        deleteConfirm(Permission.delete.bind(this, node.id), () => {
          removeNodeInTree.bind(null, this.treenodes, node.id)
          delete expanded[node.id]
        })
      }
    },
    sort (e) {
      var parameter = {
        id: e.item.dataset.id,
        from: e.oldIndex,
        to: e.newIndex
      }
      Permission.priority(parameter)
    }
  }
}
</script>
