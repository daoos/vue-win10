<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item">用户</li>
    </ol>
    <div class="row no-gutters flex-grow">
      <div class="col-md-8 col-lg-3">
        <div class="bg-white h-100 mx-3 p-3 shadowed">
          <div class="input-holder b-ddd rad-3"><i class="ti-search"></i>
            <input name="keyword" v-model.trim="keyword" class="form-control" :placeholder="'搜索' + typename">
          </div>
          <div class="mt-3 px-3 bb-eee">用户</div>
          <div class="list-group stateful no-border mt-2">
            <router-link to="/users/all" class="list-group-item" active-class="status-primary"><i class="ti-user"></i>&nbsp;&nbsp;所有用户</router-link>
            <router-link to="/users/fresh" class="list-group-item" active-class="status-primary"><i class="ti-face-smile"></i>&nbsp;&nbsp;新添加的用户</router-link>
            <router-link to="/users/free" class="list-group-item" active-class="status-primary"><i class="ti-face-sad"></i>&nbsp;&nbsp;未分配部门的用户</router-link>
            <router-link to="/users/ban" class="list-group-item" active-class="status-primary"><i class="ti-na"></i>&nbsp;&nbsp;停用的用户</router-link>
          </div>

          <div class="mt-3 px-3 bb-eee">部门</div>

          <children class="mt-2" :depts="depts"></children>
          <router-link to="/department/new" class="list-group-item link font-sm b-no mt-2">
            <span class="img-btn">┼</span>
            <span>创建部门</span>
          </router-link>
        </div>
      </div>

      <div class="col-md-8 col-lg-9 mt-3 mt-md-0">
        <div class="layer-loading" v-show="loading"><i></i><i></i><i></i></div>
        <div class="bg-white h-100 mx-3 ml-md-0 shadowed">
          <div class="d-flex justify-content-between align-items-center p-4 text-themedark" v-if="dept">
            <div class="font-xl">{{typename}} · {{page.totalCount}}</div>
            <div class="font-sm">
              <user-select class="d-none d-md-inline-block" :dept="dept" @added="added"></user-select>
              <router-link :to="'/department/new?parent=' + this.dept" class="ml-3 link">
                <span class="img-btn">┼</span> 创建子部门
              </router-link>
              <div class="selectize dropdown ml-3">
                <a dropdown-toggle class="link"><i class="fa fa-ellipsis-h"></i> 更多</a>
                <div class="dropdown-menu dropdown-menu-right mt-1">
                  <div class="dropdown-title"><i class="ti-angle-left left" v-show="action != 'menu'" @click="action = 'menu'"></i>{{action == 'menu' ? '部门菜单' : '删除部门'}}</div>
                  <div class="dropdown-item-group" v-if="action == 'menu'">
                    <router-link :to="'/department/' + dept" class="dropdown-item">编辑部门</router-link>
                    <a class="dropdown-item text-danger" @click="action = 'del'">删除部门</a>
                  </div>
                  <div class="dropdown-item-group p-3" v-if="action == 'del'">
                    <p>删除部门会同时删除其子部门，部门中的成员不会被删除。</p>
                    <a class="btn btn-danger btn-block text-white" @click.stop="del">确定</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center p-4 text-themedark" v-else>
            <div class="font-xl">{{typename}} · {{page.totalCount}}</div>
            <router-link to="/user/new" class="link font-sm"><span class="img-btn">┼</span> 添加用户</router-link>
          </div>

          <div class="row no-gutters align-items-center py-2 px-4 bt-eee" v-for="(item, index) in page.items" :key="item.id">
            <router-link class="col d-flex text-grey" :to="'/user/' + item.id">
              <span class="img rounded-circle" :style="{backgroundImage: 'url(' + item.avatar + ')'}"></span>
              <div class="ml-3">
                <div>{{item.name}}</div>
                <div class="text-muted font-xxs">{{item.email}}</div>
              </div>
            </router-link>
            <div class="col-3 d-none d-md-block">{{item.departmentName}}</div>
            <div class="col-3 d-flex justify-content-end">
              <user-menu :roles="roles" :user="item" :index="index"></user-menu>
            </div>
          </div>
          <pagination class="px-4 py-3" :page="page" @paging="paging"></pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { debounce, removeNodeInTree } from '../../misc/utils'
import { User, Role, Department } from '../../resources'
import Pagination from '../../widgets/pagination.vue'
import UserSelect from './user-select'
import UserMenu from './user-menu.vue'

var pageBackup = null  // 初始化分页数据备份
var deptMap = null     // 部门Map数据

var mapAttr = function (e) {
  e.opened = false
  e.children && e.children.map(mapAttr)
  return e
}

export default {
  name: 'Users',
  data: () => ({
    loading: 0,   // 列表加载指示
    keyword: '',  // 搜索关键字
    action: 'menu',
    type: '',     // 过滤用户类型
    dept: '',     // 过滤部门(ID)
    depts: [],    // 部门树
    roles: [],    // 所有角色
    page: {}      // 分页对象
  }),
  beforeRouteEnter (to, from, next) {
    Promise.all([User.query(to.params), Department.tree(true), Role.all()]).then(([users, depts, roles]) => {
      next(vm => {
        vm.depts = depts.data.tree.map(mapAttr)
        vm.roles = roles.data
        deptMap = depts.data.map  // 备份部门数据
        vm.type = to.params.type || 'all'
        vm.dept = to.params.dept
        vm.page = users.data
        if (vm.type === 'all') {  // 备份默认数据
          pageBackup = users.data
        }
        vm.$nextTick(() => {
          vm.$emit('loaded')
          vm.loading = 0
        })
      })
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.type = to.params.type || 'all'
    this.dept = to.params.dept
    this.$emit('loaded')
    this.paging(1, next)
  },
  methods: {
    paging (pn, cb) {  // 分页查询用户
      this.loading = 1
      User.query({keyword: this.keyword, type: this.type, dept: this.dept, pn: pn || 1}).then(response => {
        this.page = response.data
        this.loading = 0
        if (typeof  cb == 'function') cb()
      })
    },
    paging_delayed: debounce(function () { this.paging(1) }, 400), // 分页查询用户, 但有400毫秒延迟
    added (user) {  // 添加用户到部门成功
      user.roleName = this.roles.find(e => e.id === user.roleId)['name']
      user.departmentName = deptMap[user.departmentId].name
      this.page.items.unshift(user)
      this.page.totalCount++
    },
    del () {  // 删除部门
      Department.delete(this.dept).then(response => {
        if (response.data.success) {
          removeNodeInTree(this.depts, this.dept)
          this.$notice.success('部门删除成功!')
          this.$router.replace('/users')
        }
      })
    }
  },
  watch: {
    keyword (v) {
      if (!v && this.type === 'all' && pageBackup) { // 已经备份过原始数据, 直接使用跳过查询
        return this.page = pageBackup
      }
      this.loading = 1
      this.paging_delayed()
    }
  },
  computed: {
    typename () {
      if (this.type === 'dept') {
        return deptMap[this.dept].name
      }
      return {all: '所有用户', fresh: '新添加的用户', free: '未分配部门的用户', ban: '停用的用户'}[this.type]
    }
  },
  components: {
    Pagination,
    UserSelect,
    UserMenu,
    Children: {
      name: 'children',
      props: ['depts'],
      render (h) {
        var that = this

        // 渲染节点元素
        function contents (node) {
          var parent = node.children && node.children.length, // 是否为父节点
            sub = [] // 节点(dd-content)内部元素数组
          // 名称
          sub.push(h('span', {domProps: {innerHTML: node.name}}))
          // 展开指示
          if (parent) {
            sub.push(h('span', {
              class: ['expander link'],
              on: {click: () => node.opened = !node.opened}
            }))
          }
          var arr = [h('a', {
            class: ['list-group-item', node.opened ? 'opened' : '', that.$route.params.dept == node.id ? 'status-warning' : ''],
            style: {paddingLeft: node.level * 1.25 + 'rem'},
            on: {click: () => that.$router.push('/users/dept/' + node.id)}
          }, sub)]
          // 如果节点包含子节点, 生成子节点列表
          if (parent) {
            arr.push(h('div', {class: 'list-group stateful no-border'}, node.children.map(contents)))
          }
          return arr
        }

        return h('div', {class: 'list-group stateful no-border'}, this.depts.map(contents))
      }
    }
  }
}
</script>

<style>
  .list-group > .list-group { display: none }
  .list-group-item .expander { position: absolute; right: 1rem }
  .list-group-item .expander::before { font-family: themify; content: '\E65D' }
  .list-group-item.opened > .expander::before { content: '\E65F' }
  .list-group-item.opened + .list-group { display: block }
</style>
