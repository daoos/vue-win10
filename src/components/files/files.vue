<!--
  文件库 (上传至七牛)
-->
<template>
  <div>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">系统管理</li>
      <li class="breadcrumb-item">文件库</li>
    </ol>
    <div class="bg-white flex-grow shadowed relative mx-3" ref="view">
      <div class="layer-loading" v-show="loading"><i></i><i></i><i></i></div>
      <div class="flex-middle p-3">
        <ol class="breadcrumb path p-1">
          <router-link v-if="parents.length" class="breadcrumb-item" active-class="" to="/files">文件库</router-link>
          <li v-else class="breadcrumb-item">文件库</li>
          <template v-for="(item, index) in parents">
            <li class="breadcrumb-item" :key="item.id" v-if="index == parents.length - 1">{{item.name}}</li>
            <router-link class="breadcrumb-item" :to="'/files/' + item.id" :key="item.id" v-else>{{item.name}}</router-link>
          </template>
        </ol>
        <div class="font-sm ml-auto d-none d-md-block">
          <a class="link" @click="createFolder"><span class="img-btn">┼</span>&nbsp;创建文件夹</a>
          <label class="link ml-3"><input ref="fileinput" type="file" @change="change($event)" multiple hidden/><span class="img-btn">┼</span> 上传</label>
          <div class="dropdown selectize ml-3">
            <a dropdown-toggle class="link"><i class="fa fa-ellipsis-h"></i> 更多</a>
            <div class="dropdown-menu dropdown-menu-right">
              <div class="dropdown-title">更多</div>
              <div class="dropdown-item-group">
                <b class="dropdown-item"><i class="fa fa-file-o"></i>上传文件</b>
                <b class="dropdown-item"><i class="fa fa-folder-open-o"></i>上传文件夹</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sep mx-3 my-0"></div>
      <div class="flex-middle col-header text-grey mx-3">
        <div class="col check">
          <label class="ui-check"><input type="checkbox" @change="check"><i></i></label>
        </div>
        <div class="filecontent bb-0 font-sm" v-if="checked.length">
          <a>已选择 {{checked.length}} 项</a>
          <a class="link ml-4" @click="download"><i class="ti-arrow-circle-down"></i> 下载</a>
          <a class="link ml-4" v-show="checked.length == 1" @click="$refs.fileinput.click()"><i class="ti-arrow-circle-up"></i> 更新</a>
          <a class="link ml-4"><i class="ti-split-v-alt"></i> 移动</a>
          <a class="link ml-4"><i class="ti-files"></i> 复制</a>
          <a class="link ml-4" @click="del(0)"><i class="ti-trash"></i> 删除</a>
        </div>
        <div class="filecontent bb-0 no-gutters" v-else>
          <a class="col name link" :class="{sortable: params.sort == 'name', asc: params.asc}" @click="sort('name')">文件名 <i></i></a>
          <a class="col size link d-none d-md-block" :class="{sortable: params.sort == 'size', asc: params.asc}" @click="sort('size')">大小 <i></i></a>
          <a class="col creator hidden-lg-down">创建者</a>
          <a class="col updated link hidden-lg-down" :class="{sortable: params.sort == 'updated', asc: params.asc}" @click="sort('updated')">更新时间 <i></i></a>
          <div class="col text-right">
            <a class="hint-top" aria-label="列表视图"><i class="link mx-1 active ti-view-list-alt"></i></a>
            <a class="hint-top" aria-label="缩略图模式"><i class="link mx-1 ti-view-grid"></i></a>
          </div>
        </div>
      </div>
      <div class="sep mx-3 my-0"></div>
      <ul class="list-unstyled text-grey filelist" ref="list">
        <!-- 创建文件夹项 -->
        <li class="flex-middle px-3" v-show="create">
          <div class="col check"><label class="ui-check"><input type="checkbox" disabled><i></i></label></div>
          <div class="filecontent no-gutters">
            <div class="col name">
              <span class="fa fa-folder img-sm"></span>
              <input placeholder="按 回车(Enter) 创建文件夹" ref="input" @keyup="submit" @focusout="submit">
            </div>
            <div class="col size d-none d-md-block">-</div>
            <div class="col creator hidden-md-down">-</div>
            <div class="col hidden-md-down">-</div>
          </div>
        </li>
        <!-- 文件列表 -->
        <li class="flex-middle px-3" v-for="(item, index) in page.items" :key="item.id">
          <div class="col check">
            <label class="ui-check"><input type="checkbox" :value="item.id" name="files" @change="check"><i></i></label>
          </div>
          <div class="filecontent no-gutters" @mouseenter="current = item">
            <div class="col name" @click="open(item)">
              <span class="fa fa-folder img-sm" v-if="item.folder == 1"></span> <!-- 文件夹 -->
              <span class="img img-sm" :style="{backgroundImage: 'url(' + item.url + ')'}" v-else-if="item.mime.startsWith('image/')"></span> <!-- 图片 -->
              <img class="img-sm" src="/static/img/file_ps.svg" v-else> <!-- 其它类型文件 -->
              <input v-if="item.edit" :value="item.name" @keyup="submit($event, item)" @focusout="submit($event, item)" placeholder="文件名">
              <span v-else class="px-3">{{item.name}}</span>
            </div>
            <div class="col size d-none d-md-block" v-if="item.folder == 1">-</div>
            <div class="col size d-none d-md-block" v-else>{{item.size | filesize}}</div>
            <div class="col creator hidden-lg-down">{{item.creater}}</div>
            <div class="col updated hidden-lg-down">{{item.updatedTime | timepast}}</div>
            <div class="col actions d-none d-md-block" :class="index > 7 ? 'dropup' : ''">
              <a class="link px-2 hint-top" aria-label="下载" :href="item.url" :download="item.name"><i class="ti-arrow-circle-down"></i></a>
              <label class="link px-2 hint-top" aria-label="更新"><input type="file" @change="change($event, item, index)" hidden/><i class="ti-arrow-circle-up"></i></label>
              <a class="link px-2 hint-top" aria-label="移动"><i class="ti-split-v-alt"></i></a>
              <a class="link px-2 hint-top" aria-label="重命名" @click.stop="edit($event, item)"><i class="ti-pencil"></i></a>
              <b class="link px-2 hint-top toggle" aria-label="更多操作"><i class="ti-angle-down"></i></b>
            </div>
          </div>
        </li>
      </ul>
      <pagination class="py-3" :page="page" @paging="paging" :sizes="[10, 20, 50]"></pagination>
      <dropdown class="dropdown-menu-right mt-1" trigger=".toggle">
        <div class="dropdown-title">{{current.folder ? '文件夹菜单' : '文件菜单'}}</div>
        <div class="dropdown-item-group">
          <b class="dropdown-item"><i class="ti-files"></i>复制文件</b>
          <b class="dropdown-item"><i class="ti-files"></i>移动文件</b>
          <b class="dropdown-item" @click="clipboard"><i class="ti-link"></i>复制文件{{current.folder ? '夹' : ''}}链接</b>
          <b class="dropdown-item" @click="del"><i class="ti-trash"></i>删除文件</b>
        </div>
      </dropdown>
    </div>

    <div class="upload-queue-wrapper" :class="{minimize}" v-show="showQueue">
      <div class="card">
        <div class="card-header text-right pointer" @click="minimize = !minimize">
          <span class="float-left" v-if="queueing && queue.length">正在上传 1 / {{queue.length}}</span>
          <span class="float-left" v-else>上传完成</span>
          <a class="link ml-2" :class="[minimize ? 'ti-arrow-up' : 'ti-arrow-down']"></a>
          <a class="link ml-2 ti-close" @click="showQueue = false"></a>
        </div>
        <ul class="upload-queue">
          <li class="upload-item flex-middle" :key="index" v-for="(observable, index) in queue">
            <span class="img img-sm" :style="{backgroundImage: 'url(' + observable.url + ')'}" v-if="observable.type.startsWith('image/')"></span>
            <img class="img-sm" src="/static/img/file_ps.svg" v-else>
            <div class="flex-fill ml-2">
              <div class="flex-middle text-truncate">
                <span class="upload-name">{{observable.name}}</span>
                <span class="upload-info">({{observable.total.loaded | filesize}}/{{observable.total.size | filesize}})</span>
              </div>
              <div class="progress progress-xxs">
                <span class="progress-bar bg-skyblue" :style="{width: observable.total.percent + '%'}"></span>
              </div>
            </div>
            <i class="upload-operation link ti-check" v-if="observable.complete"></i>
            <a class="upload-operation link ti-close" v-else @click="abort(observable, index)"></a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { filesize, shorten, closest, deleteConfirm } from '../../misc/utils'
import Pagination from '../../widgets/pagination.vue'
import Dropdown from '../../widgets/dropdown'
import { FileMapping, baseURL } from '../../resources'
import clipboard from 'clipboard-polyfill'
import * as qiniu from 'qiniu-js'

var maxsize = 1024 * 1024 * 10   // 最大10MB
var token

export default {
  components: {Pagination, Dropdown},
  data: () => ({
    showQueue: false,   // 显示上传队列
    queueing: false,    // 是否正在上传
    minimize: true,     // 最小化上传队列
    loading: false,     // 加载指示
    current: {},
    parents: [],        // 当前文件夹路径数组
    checked: [],
    queue: [],
    create: false,      // 创建文件夹
    params: {
      parent: 0,        // 父文件 (当前目录)
      sort: 'uploaded',  // 排序字段
      asc: false        // 是否正序
    },
    page: {}
  }),
  beforeRouteEnter (to, from, next) {
    var parent = to.params.parent || 0
    var promise = parent ? FileMapping.parents(parent) : Promise.resolve(parent)
    Promise.all([FileMapping.query({parent, sort: 'uploaded'}), promise]).then(([paging, parents]) => {
      next(vm => {
        vm.params.parent = parent
        vm.parents = parents ? parents.data : []
        vm.page = paging.data
        vm.$nextTick(() => {
          vm.loading = false
          vm.$emit('loaded')
        })
      })
    })
  },
  beforeRouteUpdate (to, from, next) {
    var parent = to.params.parent || 0
    this.params.parent = parent
    var promise = parent ? FileMapping.parents(parent) : Promise.resolve(parent)
    Promise.all([FileMapping.query(this.params), promise]).then(([paging, parents]) => {
      this.parents = parents ? parents.data : []
      this.page = paging.data
      this.$nextTick(() => {
        this.loading = false
        this.$emit('loaded')
        next()
      })
    })
  },
  methods: {
    createFolder () {
      var input = this.$refs.input
      this.create = true
      input.value = ''
      this.$nextTick(() => {
        input.focus()
      })
    },
    clipboard () {
      var link = this.current.url
      if (this.current.folder) {
        link = location.href.replace(/(\/\d+)?$/, '/' + this.current.id)
      }
      clipboard.writeText(link).then(() => {
        this.$notice.success('链接复制成功', '文件链接已经复制到系统切剪板.')
      })
    },
    submit (e, file) { // 提交文件修改, file为空时表示创建文件夹, 否则为重命名
      var temp = {
        parent: this.params.parent,
        folder: 1, // 标识为文件夹
        name: e.target.value.trim()
      }
      // keyup事件 (先于focusout执行)
      if (e.type == 'keyup') {
        if (e.keyCode == 13 || e.keyCode == 27) { // 按下Enter或Esc键, 触发失焦事件
          file && (file.edit = false)
          this.create = false
          if (e.keyCode == 27) {
            file && (file.canceled = true)  // focusout事件不能被取消(e.cancelable=false), 通过该标识通知focusout事件
          }
        }
        return
      }
      // focusout失焦事件
      if (!temp.name || (file && (temp.name == file.name || file.canceled))) { // 无输入值或同名, 撤消操作
        this.create = false
        if (file) {
          file.canceled = false
          file.edit = false
          if (file.ext) {   // 恢复扩展名
            file.name += '.' + file.ext
          }
        }
        return
      }
      if (file) { // 重命名
        file.name = temp.name
        if (file.ext) { // 恢复扩展名
          file.name += '.' + file.ext
        }
      }
      FileMapping.save(file || temp).then(response => {
        this.create = false
        if (file) {
          file.edit = false
        }
        if (response.data.success) {
          if (file) {
            this.$notice.success('重命名成功')
          } else {
            this.page.items.unshift(response.data.file)
            this.$notice.success('文件夹创建成功')
          }
        } else {
          this.$notice.error(response.data.msg)
          if (file) {
            file.name = file.original
          }
        }
      })
    },
    paging (pn, ps) {
      FileMapping.paging(this, pn, ps).then(() => {
        this.$refs.view.querySelectorAll('input[type=checkbox]').forEach(f => f.checked = false)
        this.checked = []
      })
    },
    check (e) {
      var files = this.$refs.list.querySelectorAll('input[name=files]'),
        target = e.target
      var checked = []
      for (var i = 0; i < files.length; i++) {
        var f = files[i]
        if (target.name) {
          if (f.checked) {
            checked.push(f.value)
          }
        } else if (f.checked = target.checked) {
          checked.push(f.value)
        }
      }
      this.checked = checked
    },
    edit (e, file) {  /* 点击修改图标, 显示输入框并获取焦点 */
      file.original = file.name
      file.edit = true
      if (!file.folder) {
        var dot = file.name.lastIndexOf('.')
        if (dot >= 0) { // 隐藏扩展名
          file.name = file.name.substring(0, dot)
        }
      }
      this.$nextTick(() => closest(e.target, '.filecontent').querySelector('input').focus())
    },
    sort (sort) {
      if (this.params.sort === sort) {
        this.params.asc = !this.params.asc
      } else {
        this.params.asc = true
      }
      this.params.sort = sort
      this.paging()
    },
    open (file) { // 点击(打开)文件
      if (file.edit) return // 编辑时忽略
      if (file.folder) {    // 打开文件夹
        this.$router.push('/files/' + file.id)
      } else {

      }
    },
    move () { /* 移动文件 */ },
    del (e) { /* 删除文件 */
      deleteConfirm(FileMapping.deleteBatch.bind(this, e ? [this.current.id] : this.checked), () => this.paging())
    },
    change (e, item, index) { // 开始选择文件(上传)
      if (token) return this.upload(e.target, item, index)
      this.$http.get('/filemapping/uptoken').then(response => {
        token = response.data.uptoken
        this.upload(e.target, item, index)
      })
    },
    upload (target, item, index) {
      var that = this
      that.showQueue = true
      for (let file of target.files) {
        if (file.size > maxsize) {
          return that.$notice.warning('文件`' + file.name + '`大小超过限制, 请上传小于' + filesize(maxsize) + '的文件')
        }
        let task = {
          complete: false,
          total: {
            percent: 0,
            loaded: 0,
            size: 0
          },
          size: file.size,
          name: file.name,
          type: file.type,
          url: ''
        }
        if (file.type.startsWith('image/')) { // 如果为图片文件, 读取DataURL显示图片
          let reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = (e) => task.url = e.target.result
        }
        let key = shorten() + file.name.substr(file.name.lastIndexOf('.'))
        task.subscription = qiniu.upload(file, key, token).subscribe({ // 开始上传
          next: (res) => task.total = res.total,
          error: (err) => console.log('error', err),
          complete (res) {
            task.complete = true
            var obj = Object.assign(item || {}, {
              parent: that.params.parent,
              name: task.name,
              mime: task.type,
              size: task.size,
              hash: res.hash,
              key: res.key
            })
            FileMapping[item ? 'update' : 'save'](obj).then(response => {
              Object.assign(task, response.data.file)
              item ? that.page.items.splice(index, 1, task) : that.page.items.unshift(task)
            })
          }
        })
        that.queue.unshift(task)
      }
      that.minimize = false
      that.queueing = true
      target.value = ''
    },
    download () {
      window.location.assign(baseURL + '/filemapping/download?ids=' + this.checked.join(','))
    },
    abort (task, index) { // 取消上传
      task.subscription.unsubscribe()
      this.queue.splice(index, 1)
    }
  }
}
</script>

<style>
  .path a[href]:hover { color: #0c92f3 }
  .col.name, .upload-name { text-overflow: ellipsis; white-space: nowrap; overflow: hidden }
  .col-header .link i { vertical-align: text-top }
  .col.check { text-align: center }
  .col.name {
    display: flex;
    align-items: center;
    min-width: 45%;
    cursor: pointer;
  }
  .col.name .fa-folder { font-size: 2.3rem; color: #3da8f5 }
  .col.name input {
    background-color: #FFFFFF;
    border: 1px solid #D9D9D9;
    margin-left: .625rem;
    padding: 0 .3125rem;
    border-radius: 3px;
    line-height: 28px;
    outline: 0;
    flex: 1;
  }
  .col.size,
  .col.updated { max-width: 6rem }
  .col.creator { max-width: 8rem }
  .col.actions { opacity: 0; transition: all 218ms; text-align: center }
  .filelist li { transition: background-color 218ms; position: relative }
  .filelist li:hover { background: #f5f5f5 }
  .filelist li:hover .actions { opacity: 1 }
  .filelist li .col, .col-header .col { white-space: nowrap }
  .filecontent {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f5f5f5;
    padding: 0 1rem;
    height: 3.5rem;
    width: 100%;
  }
  /* 上传队列 */
  .upload-queue-wrapper {
    box-shadow: 0 7px 21px rgba(0, 0, 0, 0.1);
    transition: bottom .3s;
    position: fixed;
    width: 480px;
    bottom: 1rem;
    z-index: 23;
    right: 2rem;
  }
  .upload-queue-wrapper.minimize { bottom: -15rem }
  .upload-queue-wrapper .card-header { border-bottom: 1px solid #e1e1e1 }
  .upload-queue {
    padding: .6rem .6rem 0;
    background: #fbfbfb;
    list-style: none;
    overflow-y: auto;
    height: 15rem;
    margin: 0;
  }
  .upload-item {
    padding: .5rem 0 .5rem .5rem;
    margin-bottom: .6rem;
    background: #efefef;
    font-size: .875rem;
  }
  .upload-operation { text-align: center; width: 3rem }
  .upload-item .progress { background: #d0eaff; margin-top: 3px }
  .upload-item .ti-check { color: #0275d8 !important }
  .upload-name { max-width: 14rem }
  .upload-info { margin: 3px 0 0 1rem; font-size: 12px; color: #A6A6A6 }
  @media (max-width: 767px) {
    .col.name { max-width: 16rem }
  }
</style>
