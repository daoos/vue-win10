<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item active">权限管理</li>
    </ol>
    <div class="card mx-3 b-no">
      <div class="layer-loading" v-show="loading"><i></i><i></i><i></i></div>
      <div class="text-muted p-3 pb-0">系统权限列表
        <router-link to="/permission/alt">(样式二)</router-link>
      </div>
      <div class="flex-middle px-3 mb-3">
        <div class="btn-group btn-group-sm">
          <span class="btn btn-outline-secondary" title="expandAll" @click="toggle">展开全部</span>
          <span class="btn btn-outline-secondary" title="collapseAll" @click="toggle">折叠全部</span>
        </div>
        <router-link class="ml-auto" to="/permission/new" v-permission="'permission.add'"><span class="img-btn">┼</span> 新增权限</router-link>
      </div>

      <table class="table table-advanced table-hover treetable" ref="treetable">
        <thead>
        <tr>
          <th>名称</th>
          <th class="d-none d-md-table-cell">编码</th>
          <th class="d-none d-xl-table-cell">优先级</th>
          <th class="text-xs-center">操作</th>
        </tr>
        </thead>
        <tbody>
        <tr :data-id="item.id" :data-parent="item.parent" v-for="(item, index) in items" :key="item.id">
          <td><a class="link" @click.stop="edit(item.id)"><i :class="item.icon"></i>{{item.name}}</a></td>
          <td class="d-none d-md-table-cell">{{item.code}}</td>
          <td class="d-none d-xl-table-cell">{{item.priority}}</td>
          <td class="text-xs-center">
            <router-link class="badge badge-secondary font-sm" :to="'/permission/' + item.id"><i class="fa fa-pencil"></i> 编辑</router-link>
            <router-link class="d-none d-md-inline-block badge badge-light font-sm" :to="'/permission/new?parent=' + item.id"><i class="fa fa-angle-double-down"></i> 添加下级</router-link>
            <a class="d-none d-md-inline-block badge badge-light text-danger font-sm" @click.prevent="del(item.id, index)" href><i class="fa fa-trash-o"></i> 删除</a>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { keyForPermissionTreeState } from '../../constants'
import { deleteConfirm, treeify } from '../../misc/utils'
import { Permission } from '../../resources'

// 这里的代码只会调用一次，切换样式一/样式二时会不同步，各自有独立的状态，这里不做处理，因为通常只会使用一种样式
var stored = localStorage.getItem(keyForPermissionTreeState)  // get stored expanded nodes
var expanded = stored ? JSON.parse(stored) : {}

export default {
  data: () => ({
    loading: false,
    items: []
  }),
  beforeRouteEnter (to, from, next) {
    Permission.treetable().then(response => {
      next(vm => {
        vm.items = response.data
        vm.$nextTick(() => {
          vm.$treetable = treeify(vm.$refs.treetable, expanded)
          vm.$emit('loaded')
        })
      })
    })
  },
  methods: {
    toggle (e) {
      var target = e.target
      var next = target.previousElementSibling || target.nextElementSibling
      target.classList.add('active')
      next.classList.remove('active')
      this.$treetable[e.target.title]()
    },
    edit (id) {
      this.$router.push('/permission/' + id)
    },
    del (id, index) {
      deleteConfirm(Permission.delete.bind(this, id), function () {
        this.items.splice(index, 1)
        delete expanded[id]
      })
    }
  },
  destroyed () {
    localStorage.setItem(keyForPermissionTreeState, JSON.stringify(expanded))
  }
}
</script>
