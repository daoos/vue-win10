<template>
  <div class="app" >
    <vue-particles class="particles-js"
      color="#dedede"
      :particleOpacity="0.7"
      :particlesNumber="88"
      shapeType="star"
      :particleSize="8"
      linesColor="#dedede"
      :linesWidth="2"
      :lineLinked="true"
      :lineOpacity="0.6"
      :linesDistance="150"
      :moveSpeed="3"
      :hoverEffect="true"
      hoverMode="grab"
      :clickEffect="true"
      clickMode="push"
    >
    </vue-particles>
      <div class="login-box container text-center fadeIn ">
        <div>
          <img src="../assets/img/logos/logo-big.png">
        </div>
        <span><div class="text-muted mb-2"><b>登录</b></div></span>
        <form @submit.prevent="done" class="text-left" autocomplete="off">
          <div class="form-group">
            <input name="name" v-model="name" v-validate="'required|min:3'" title="用户名/邮箱/手机号" placeholder="用户名/邮箱/手机号" class="form-control login-box-input" autofocus>
            <span class="invalid-feedback">{{ errors.first('name') }}</span>
          </div>
          <div class="form-group relative">
            <input name="pass" v-model="pass" v-validate="'required|min:3'" title="密码" placeholder="密码" class="form-control login-box-input" type="password">
            <span class="invalid-feedback">{{ errors.first('pass') }}</span>
            <button class="btn btn-outline-primary rad-30" :class="{'loading': loading}" :disabled="errors.any() || loading">登 录</button>
          </div>
          <div class="clearfix mb-2">
            <label class="ui-check float-left icheckbox_square-blue">
              <input type="checkbox" name="rememberMe" ><i class="text-dark"></i> <span class="font-xs align-middle"><b>记住我</b></span>
            </label>
          </div>
        </form>
        <div class="clearfix">
          <router-link to="/signup" class="float-left"><b>注册</b></router-link>
          <router-link to="/logout" class="float-right"><b>忘记密码?</b></router-link>
        </div>
      </div>
  </div>
</template>

<script>
import {Auth} from '../resources'

export default {
  name: 'login',
  data: () => ({
    name: 'admin',
    pass: 'admin',
    rememberMe: false,
    loading: false
  }),
  methods: {
    done () {
      this.loading = true
      Auth.login(this.$data, (res) => {
        this.loading = false
        if (res.data.success) {
          return this.$router.replace(this.$route.query.redirect || '/')
        }
        this.$notice.warning(res.data.msg)
      })
    }
  },
  mounted () {
    document.body.classList.remove('preloader')
  }
}
</script>

<style>
  .particles-js {
    /*background-image: url("./assets/sky.jpg");*/
    background-size: cover;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    overflow: hidden;
    background: radial-gradient(220% 105% at top center, #4f69f4 10%, #6785a4 40%, #6f4ca4 65%, #726da4);
    /*background-color: #26AFE3;*/
  }
  .login-box {
    z-index: 2;
    margin: 12% auto;
    width: 380px;
    /*height: 250px;*/
    border-radius: 40px;
    box-shadow: 0 0 50px rgba(0, 0, 0, .2);
    padding: 30px;
    display: inline-block;
    background: rgba(255, 255, 255, 0.6);
  }
  .login-box-input{
    border-radius: 40px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.6);
  }
  .login-box button { position: absolute; right: 0; top: -0px }
  @media (max-width: 767px) {
    .login-box { width: 100% }
  }
</style>
