<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item active">字典信息</li>
    </ol>
    <div class="card mb-3 mx-3">
      <div class="layer-loading" v-show="loading"><i></i><i></i><i></i></div>
      <div class="text-muted px-3 pt-3">搜索字典信息.</div>
      <form class="form-row p-3" autocomplete="off" @submit.prevent="paging">

        <div class="form-group col-lg-3">
          <input name="code" v-model="params.code" placeholder="字典编码" class="form-control">
        </div>

        <div class="form-group col-lg-3">
          <input name="description" v-model="params.description" placeholder="字典描述" class="form-control">
        </div>

        <div class="col">
          <button class="btn btn-outline-info"><i class="fa ti-search"></i> 搜索</button>
          <router-link class="btn btn-outline-info rad-30 float-right" to="/dict/new"><i class="fa fa-plus-square"></i> 新增</router-link>
        </div>

      </form>
      <table class="table table-hover table-advanced m-0">
        <thead>
        <tr>
          <th class="text-xs-center d-none d-lg-table-cell">#</th>
          <th>编码</th>
          <th class="d-none d-lg-table-cell">描述</th>
          <th class="text-center">操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in page.items" :key="item.id">
          <td class="text-center d-none d-lg-table-cell">{{page.firstElementIndex + index + 1}}</td>
          <td>
            <router-link :to="'/dict/' + item.code">{{item.code}}</router-link>
          </td>
          <td class="d-none d-lg-table-cell">{{item.description}}</td>
          <td class="text-xs-center nowrap">
            <router-link class="d-none d-md-inline-block badge badge-secondary font-sm" :to="'/dict/' + item.code"><i class="fa fa-pencil"></i> 编辑</router-link>
            <a class="badge badge-light text-danger font-sm" href @click="del(item.code, index)"><i class="fa fa-trash-o"></i> 删除</a>
          </td>
        </tr>
        </tbody>
      </table>
      <pagination class="pagination-sm py-3" :page="page" @paging="paging"></pagination>
    </div>
  </div>
</template>
<script>
import Pagination from '../../widgets/pagination.vue'
import {Dict} from '../../resources'
import {deleteConfirm} from '../../misc/utils'
import swal from 'sweetalert'

export default {
  data: () => ({
    params: {
      description: '',
      code: ''
    },
    loading: false,
    page: {}
  }),
  beforeRouteEnter (to, from, next) {
    Dict.query().then(response => {
      next(vm => {
        vm.page = response.data
        vm.$nextTick(() => vm.$emit('loaded'))
      })
    })
  },
  methods: {
    paging (pn) { Dict.paging(this, pn) },
    del (code, index) {
      deleteConfirm(Dict.delete.bind(this, code), () => {
        this.page.items.splice(index, 1)
      })
    }
  },
  components: {Pagination}
}
</script>
