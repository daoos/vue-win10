<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item">
        <router-link to="/department">部门管理</router-link>
      </li>
      <li class="breadcrumb-item active">{{department.name}}</li>
    </ol>
    <form autocomplete="off" @submit.prevent="submit" class="mx-3">
      <div class="card p-3 mb-3">
        <div class="mb-3">
          <h4 class="card-title">必填项</h4>
          <span class="text-muted">These fileds are <code>required</code>.</span>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">部门名称</label>
          <div class="col-sm-4">
            <input name="name" v-model="department.name" v-validate="'required'" title="部门名称" class="form-control" placeholder="部门名称" maxlength="32">
            <span class="invalid-feedback">{{ errors.first('name') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">负责人</label>
          <div class="col-sm-6 flex-middle">
            <span class="img-btn cover mr-1" :title="leader.name" :style="{backgroundImage: 'url(' + leader.avatar + ')'}"></span>
            <selectize v-model="department.leader" @change="leaderChange">
              <label class="img-btn" title="选择用户">┼</label>
            </selectize>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">上级部门</label>
          <div class="col-sm-6">
            <input class="form-control" id="department-parent" :value="parent" placeholder="上级部门" readonly>
            <dropdown attach="#department-parent">
              <tree :nodes="treenodes" v-model="department.parent" @change="change"/>
            </dropdown>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">优先级</label>
          <div class="col-sm-2">
            <input name="priority" v-model="department.priority" class="form-control" type="number" placeholder="优先级" max="9999">
          </div>
        </div>
      </div>
      <div class="px-3">
        <button class="btn btn-primary" :disabled="errors.any()"><i class="fa fa-cloud-upload"></i> 提交</button>
        <a class="btn btn-link ml-4" href="javascript:history.back()"><i class="ti-arrow-circle-left"></i> 返回</a>
      </div>
    </form>
  </div>
</template>

<script>
import {Department} from '../../resources'
import {showResponse} from '../../misc/utils'
import selectize from '../../widgets/selectize.vue'
import dropdown from '../../widgets/dropdown.vue'
import tree from '../../widgets/tree.vue'
import dict from '../../widgets/dict.vue'

export default {
  components: {selectize, tree, dict, dropdown},
  name: 'DepartmentEdit',
  data: () => ({
    department: {},
    treenodes: [],
    leader: {},
    parent: ''
  }),
  beforeRouteEnter (to, from, next) {
    Promise.all([Department.get(to.params.id), Department.jstree()]).then(([dept, tree]) => {
      next(vm => {
        vm.department = dept.data
        vm.treenodes = tree.data
        vm.$nextTick(() => vm.$emit('loaded'))
      })
    })
  },
  beforeRouteUpdate (to, from, next) {
    Department.get(to.params.id).then(perm => {
      this.department = perm.data
    })
    next()
  },
  methods: {
    leaderChange (item) {
      this.leader = item
    },
    change (nodes) {
      this.parent = nodes.length ? nodes[0].name : ''
    },
    submit () {
      this.$validator.validateAll().then(success => {
        if (!success) return
        showResponse(Department.update.bind(this, this.department), () => this.$router.back())
      })
    }
  }
}
</script>
