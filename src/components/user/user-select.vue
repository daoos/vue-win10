<template>
  <div class="selectize">
    <a class="ml-3 link" @click="show"><span class="img-btn">┼</span> 添加成员</a>
    <div class="dropdown-menu dropdown-menu-right" style="min-width: 18rem" ref="dropdown">
      <div class="input" :class="{loading : dirty || loading}">
        <input ref="input" class="form-control" v-model.trim="keyword" placeholder="搜索用户" maxlength="32" tabindex="-1">
        <i v-if="keyword" class="ti-close" @click="keyword = ''"></i>
        <i v-else class="ti-search"></i>
      </div>
      <div class="dropdown-item-group">
        <!--
        <label v-if="items.length" class="dropdown-item">
          <span class="img img-xs"><i class="fa fa-users font-lg text-grey"></i></span>
          <span class="info font-xs ml-2">添加所有</span>
        </label>
        -->
        <label v-show="!items.length && keyword" class="dropdown-item font-xs text-grey">
          <span class="py-1">没有找到该用户</span>
        </label>
        <label v-show="!items.length" class="dropdown-item">
          <span class="img-btn text-white" title="创建用户">┼</span>
          <router-link to="/user/new" class="info font-xs text-blue ml-2">创建用户</router-link>
        </label>
        <label class="dropdown-item" v-for="(item, index) in items" :key="item.id">
          <span class="img img-xs rounded-circle" :style="{backgroundImage: 'url(' + item.avatar + ')'}"></span>
          <span class="info ml-2">
            <span class="font-xs">{{item.name}}</span>
            <span class="font-xs text-grey">{{item.phone}}</span>
          </span>
          <span class="btn btn-sm font-xs btn-outline-secondary disabled" v-if="item.departmentId == dept">已添加</span>
          <span class="btn btn-sm font-xs btn-outline-info" v-else @click="add(item, index)">添加</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import {debounce} from '../../misc/utils'
import {User} from '../../resources'

var backup = [] // 初始用户列表备份, 当用户清空查询时, 直接使用备份数据而不再执行查询请求

export default {
  name: 'UserSelect',
  props: ['dept'],
  data: () => ({
    selected: [], // 选中用户列表
    idarr: [],    // 选中用户ID列表
    items: [],    // 用户列表
    keyword: '',  // 搜索关键字
    loading: 1,   // 加载标识
    dirty: 0     // 用户输入标识
  }),
  methods: {
    show () {
      var dropdown = this.$refs.dropdown
      if (!dropdown.classList.contains('show')) {
        dropdown.classList.add('show')
        !this.keyword && !this.items.length && this.paging()
        this.$refs.input.focus()
      }
    },
    paging: debounce(function () { // 查询(支持分页)
      this.loading = 1
      User.search({keyword: this.keyword}).then(response => {
        this.items = response.data
        this.loading = 0
        this.dirty = 0
        if (!backup.length) {
          backup = response.data
        }
      })
    }, 500),
    add (user, index) {  // 添加用户到部门
      User.partial({id: user.id, departmentId: this.dept}).then(response => {
        if (response.data.success) {
          user.departmentId = this.dept
          this.$notice.success('添加用户成功!')
          this.items.splice(index, 1, user)
          this.$emit('added', user)
        }
      })
    }
  },
  watch: {
    keyword (v) {
      if (!v) { // 清空搜索框时, 已经备份过原始数据, 直接使用跳过查询
        this.items = this.selected.concat(backup.filter(e => {
          return !this.idarr.includes(e.id)
        }))
        return
      }
      this.dirty = 1
      this.paging()
    }
  }
}
</script>
