<template>
  <div>
    <div class="p-3">
      <div class="h3 m-0">个人资料</div>
    </div>
    <form class="d-flex py-4 bg-white" autocomplete="off" @submit.prevent="done">
      <div class="col-md-3">
        <div class="card mb-3 img-hover">
          <label class="img-mask" id="img-mask">
            <i class="fa fa-camera"></i> 点击上传头像
            <input type="file" hidden @change="change">
          </label>
          <img class="card-img-top img-fluid" alt="用户头像" :src="img.url">
          <div class="progress-bar progress-xs" :style="{width: img.total.percent + '%'}"></div>
          <div class="card-body">
            <h3 class="d-inline-block align-middle">{{user.name}}</h3>
            <span class="badge badge-secondary">{{user.roleName}}</span>
            <div class="font-sm text-muted">最近登录为 {{user.visited}}</div>
          </div>
        </div>
      </div>

      <div class="col-md-9">
        <h4 class="text-themedark">个人信息</h4>
        <div class="sep sep-dashed"></div>
        <div class="form-group">
          <label>呢称</label>
          <input name="nick" v-model="user.nick" class="form-control" placeholder="呢称"/>
        </div>
        <div class="form-group">
          <label>密码 (无需修改请留空)</label>
          <input type="password" name="pass" v-model="user.pass" class="form-control" minlength="5" maxlength="32" placeholder="密码">
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input name="email" type="email" v-model="user.email" v-validate="'email'" class="form-control" title="邮箱地址" placeholder="请输入邮箱地址">
          <span class="invalid-feedback">{{ errors.first('email') }}</span>
        </div>
        <div class="form-group">
          <label>手机号码</label>
          <input name="phone" v-model="user.phone" v-validate="{rules: { required: true, regex: /^\d{11}$/} }" class="form-control" title="手机号码" placeholder="手机号码">
          <span class="invalid-feedback">{{ errors.first('phone') }}</span>
        </div>
        <div class="form-group">
          <label>生日</label>
          <date-select class="col-sm-6 px-0" v-model="user.birthday"></date-select>
        </div>
        <div class="form-group">
          <label>性别</label>
          <div class="form-control">
            <label class="ui-check mr-3">
              <input type="radio" name="gender" :value="1" v-model="user.gender"><i></i> <span>男</span>
            </label>
            <label class="ui-check">
              <input type="radio" name="gender" :value="0" v-model="user.gender"><i></i> <span>女</span>
            </label>
          </div>
        </div>
        <button class="btn btn-primary" :disabled="errors.any()"><i class="fa fa-cloud-upload"></i> 提交</button>
        <a class="btn btn-link ml-4" href="javascript:history.back()"><i class="ti-arrow-circle-left"></i> 返回</a>
      </div>
    </form>
  </div>
</template>

<script>
import {FileMapping, User, Auth} from '../../resources'
import {filesize, shorten} from '../../misc/utils'
import DateSelect from '../../widgets/dateselect.vue'
import * as qiniu from 'qiniu-js'

var maxsize = 1024 * 1024   // 最大1MB
var token

export default {
  components: {DateSelect},
  data: () => ({
    img: {
      complete: false,
      total: {
        percent: 0
      },
      size: 0,
      url: ''
    },
    user: {},
    role: {}
  }),
  beforeRouteEnter (to, from, next) {
    User.profile().then(response => {
      next(vm => {
        vm.user = response.data.user
        vm.img.url = vm.user.avatar
        vm.$nextTick(() => vm.$emit('loaded'))
      })
    })
  },
  methods: {
    change (e) {
      if (token) return this.upload(e.target)
      this.$http.get('/filemapping/uptoken').then(response => {
        token = response.data.uptoken
        this.upload(e.target)
      })
    },
    upload (target) {
      if (target.files.length == 0) return
      var file = target.files[0]
      if (file.size > maxsize) {
        return this.$notice.warning('文件大小超过限制, 请上传小于' + filesize(maxsize) + '的图片')
      }
      Object.assign(this.img, {
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
      })
      var reader = new FileReader() // 如果为图片文件, 读取DataURL显示图片
      reader.readAsDataURL(file)
      reader.onload = (e) => this.img.url = e.target.result
      var key = shorten() + file.name.substr(file.name.lastIndexOf('.'))
      var that = this
      qiniu.upload(file, key, token).subscribe({ // 开始上传
        next: (res) => that.img.total = res.total,
        error: (err) => console.log('error', err),
        complete (res) {
          that.img.complete = true
          var item = {
            parent: 1,
            name: that.img.name,
            mime: that.img.type,
            size: that.img.size,
            hash: that.img.hash,
            key: res.key
          }
          FileMapping.save(item).then(response => {
            Object.assign(that.img, response.data.file)
            var url = response.data.file.url
            User.http.post('/user/avatar', {url: url}).then(res => {
              if (res.data.success) {
                that.$notice.success('头像已更新')
                Auth.updateCurrentUser({avatar: url})
              }
            })
          })
        }
      })
      target.value = ''
    },
    done () {
      User.profile(this.user).then(response => {
        if (response.data.success) {
          this.$notice.success('用户信息更新成功!')
        }
      })
    }
  }
}
</script>

<style>
  .img-mask:hover {
    background: rgba(0, 0, 0, .6);
  }
  .img-mask:hover,
  .img-hover:hover .img-mask {
    opacity: 1;
    visibility: visible;
  }
  .img-mask {
    color: #fff !important;
    border-radius: .25rem .25rem 0 0;
    background: rgba(0, 0, 0, .3);
    width: 100%;
    padding: 10px;
    margin: 0;
    opacity: 0;
    visibility: hidden;
    text-align: center;
    position: absolute;
    transition: all .3s ease-in-out;
  }
</style>
