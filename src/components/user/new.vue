<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item">
        <router-link to="/users">用户</router-link>
      </li>
      <li class="breadcrumb-item active">新增用户</li>
    </ol>
    <form autocomplete="off" @submit.prevent="submit()" class="mx-3">
      <div class="card mb-3 p-3 b-no col-12">
        <div class="mb-3">
          <h4 class="card-title">必填项</h4>
          <span class="text-muted">These fileds are <code>required</code>.</span>
        </div>

        <div class="form-group row">
          <label class="col-form-label col-sm-2">用户名</label>
          <div class="col-sm-10">
            <input name="name" class="form-control" v-model="user.name" placeholder="用户名" title="用户名"
                   v-validate="{rules: { required: true, min:2, max:32, remote: ['/exists', 'name']} }">
            <span class="invalid-feedback">{{ errors.first('name') }}</span>
          </div>
        </div>

        <div class="form-group row">
          <label class="col-form-label col-sm-2">密码</label>
          <div class="col-sm-10">
            <input type="password" name="pass" v-model="user.pass" class="form-control" v-validate="'required|max:32'" placeholder="密码" title="用户密码">
            <span class="invalid-feedback">{{ errors.first('pass') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">邮箱</label>
          <div class="col-sm-10">
            <input name="email" v-model="user.email" class="form-control" v-validate="'required|email'" placeholder="邮箱" title="邮箱">
            <span class="invalid-feedback">{{ errors.first('email') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">手机号</label>
          <div class="col-sm-10">
            <input name="phone" v-model="user.phone" class="form-control" data-vv-delay="400" placeholder="手机号" title="手机号"
                   v-validate="{rules: { required: true, regex: /^\d{11}$/, remote: ['/exists', 'phone']} }">
            <span class="invalid-feedback">{{ errors.first('phone') }}</span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">呢称</label>
          <div class="col-sm-10">
            <input name="nick" v-model="user.nick" class="form-control" maxlength="32" placeholder="呢称" title="呢称">
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">生日</label>
          <date-select class="col-sm-5" v-model="user.birthday"></date-select>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">选择角色</label>
          <div class="col-sm-10">
            <select class="form-control" title="选择角色" v-model="user.roleId">
              <option v-for="item in roles" :key="item.id" :value="item.id">{{item.name}}</option>
            </select>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">所属部们</label>
          <div class="col-sm-10 dropup">
            <input class="form-control" id="department-name" placeholder="所属部门" :value="user.departmentName" readonly>
            <dropdown attach="#department-name">
              <tree :nodes="depts" v-model="user.departmentId" @change="change" class="dropup"/>
            </dropdown>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-sm-2">用户状态</label>
          <div class="col flex-middle">
            <label class="ui-switch ui-switch-lg mr-2">
              <input type="checkbox" name="status" v-model="user.status" :true-value="1" :false-value="0"><i></i>
            </label>
            <span :class="user.status ? 'text-success' : 'text-danger'">{{user.status ? '启用' : '禁用'}}</span>
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
import DateSelect from '../../widgets/dateselect.vue'
import {User, Department} from '../../resources'
import {showResponse} from '../../misc/utils'
import Dropdown from '../../widgets/dropdown'
import Tree from '../../widgets/tree.vue'

export default {
  components: {Dropdown, DateSelect, Tree},
  name: 'UserNew',
  data: () => ({
    depts: [],
    roles: [],
    user: {
      departmentName: '',
      departmentId: -1,
      roleId: 1,  // 默认为普通用户角色
      status: 1,
      name: '',
      type: 1
    }
  }),
  beforeRouteEnter (to, from, next) {
    Promise.all([User.roles(), Department.jstree()]).then(([user, depts]) => {
      next(vm => {
        vm.depts = depts.data
        vm.roles = user.data.roles
        vm.user.roleId = vm.roles[0].id
        vm.$nextTick(() => vm.$emit('loaded'))
      })
    })
  },
  methods: {
    change (nodes) {
      this.user.departmentName = nodes.length ? nodes[0].name : ''
    },
    submit () {
      this.$validator.validateAll().then(success => {
        if (!success) return
        showResponse(User.save.bind(this, this.user), () => this.$router.back())
      })
    }
  }
}
</script>
