<template>
  <div class="selectize" :class="index > 5 ? 'dropup' : 'dropdown'">

    <span v-if="!Auth.permissions.includes('user.edit')" class="text-muted" @click.stop="close"><span>{{user.roleName}}</span></span>
    <a v-else-if="!user.status" class="link" dropdown-toggle>已停用 <i class="ti-angle-down"></i></a>
    <a v-else class="link" dropdown-toggle>{{user.roleName}} <i class="ti-angle-down"></i></a>

    <div class="dropdown-menu dropdown-menu-right" ref="dropdown">
      <div class="dropdown-title"><i class="ti-angle-left left" v-show="action != 'main'" @click="action = 'main'"></i>{{actions[action]}}</div>

      <div class="dropdown-item-group" v-if="user.status && action == 'main'">
        <label class="dropdown-item" v-for="item in roles" :key="item.id">
          <input type="radio" :value="item.id" v-model="user.roleId" @change="role(item)">
          <span class="info">{{item.name}}</span>
        </label>
        <hr class="my-0 mx-3">
        <label class="dropdown-item" @click.stop="action = 'ban'">停用用户</label>
        <label class="dropdown-item text-danger" @click.stop="action = 'del'">删除用户</label>
      </div>

      <div class="dropdown-item-group" v-if="!user.status && action == 'main'">
        <label class="dropdown-item" @click.stop="action = 'unban'">启用用户</label>
        <label class="dropdown-item text-danger" @click.stop="del">删除用户</label>
      </div>

      <div class="dropdown-item-group p-3" v-if="action == 'ban'">
        <div class="mb-2">您确定要停用当前用户账号吗?</div>
        <ul class="text-grey pl-4">
          <li>被停用的用户账号将无法登录系统</li>
          <li>账号信息仍保留, 方便工作交接和管理</li>
          <li>账号可以恢复</li>
        </ul>
        <a class="btn btn-danger btn-block text-white" @click.stop="ban(0)">确定</a>
      </div>

      <div class="dropdown-item-group p-3" v-if="action == 'del'">
        <p>确定要删除用户吗?</p>
        <a class="btn btn-danger btn-block text-white" @click.stop="del">确定</a>
      </div>

      <div class="dropdown-item-group p-3" v-if="action == 'unban'">
        <p>您确定要启用当前用户帐号吗?</p>
        <p class="text-grey">该账号将恢复为默认角色.</p>
        <a class="btn btn-info btn-block text-white" @click.stop="ban(1)">确定</a>
      </div>
    </div>
  </div>
</template>

<script>
import { User, Auth } from '../../resources'

export default {
  name: 'usermenu',
  props: ['user', 'index', 'roles'],
  data () {
    return {
      initial: this.user.roleId,
      actions: {
        main: '用户菜单',
        unban: '启用用户',
        ban: '停用用户',
        del: '删除用户'
      },
      action: 'main',
      Auth
    }
  },
  methods: {
    role (role) {  // 更改用户角色
      User.role(this.user.id, role.id).then(response => {
        if (response.data.success) {
          this.user.roleName = role.name
          this.$notice.success('角色修改成功')
          return this.close()
        }
        this.$notice.warning(response.data.msg)
        this.user.roleId = this.initial
      })
    },
    del (exec) {
      User.delete(this.user.id).then(response => {
        if (response.data.success) {
          this.$notice.success('删除用户成功!')
          this.action = 'menu'
          this.close()
        }
      })
    },
    ban (status) { // 启用用户
      User.status(this.user.id, status).then(response => {
        if (response.data.success) {
          this.$notice.success(this.actions[this.action] + '成功!')
          this.user.status = status
          this.action = 'menu'
          this.close()
        }
      })
    },
    close () {
      this.$refs.dropdown.classList.remove('show')
      this.action = 'main'
    }
  }
}
</script>
