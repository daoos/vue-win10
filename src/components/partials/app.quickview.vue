<template>
  <div class="app-quickview">
    <div class="app-quickview-wrapper">
      <div class="relative bg-light">
        <a class="absolute-middle mr-2 r-0" @click.prevent="close" href><i class="fa fa-times"></i></a>
        <ul class="nav nav-tabs nav-icon nav-line nav-justified py-1">
          <li class="nav-item">
            <a href="#f1" class="active"><i class="fa fa-globe fa-2x"></i></a>
          </li>
          <li class="nav-item">
            <a href="#f2"><i class="fa fa-exchange fa-2x"></i></a>
          </li>
          <li class="nav-item">
            <a href="#f3"><i class="fa fa-user fa-2x"></i></a>
          </li>
        </ul>
      </div>
      <div class="tab-content">
        <div id="f1" role="tabpanel" class="tab-pane p-3 active">
          <div class="info-line pb-3">
            <div class="item" :key="item" v-for="item in 6">
              <div class="text-muted">5 minutes ago</div>
              <div>Revert "Use jsDelivr CDN until BootstrapCDN gets updated</div>
            </div>
          </div>
          <div class="btn btn-outline-secondary btn-block">Load more</div>
        </div>
        <div id="f2" role="tabpanel" class="tab-pane">
          <ul class="list-group list-group-gap list-group-sm p-3">
            <li class="list-group-item d-block" :key="item" :class="'b-' + colors[item % 5]" v-for="item in 6">
              <div class="text-muted">Invoice #43344334</div>
              <div :class="'text-' + colors[item % 5]">Paid</div>
            </li>
          </ul>
        </div>
        <div id="f3" role="tabpanel" class="tab-pane">
          <a class="d-flex pt-2 px-3" :key="item" v-for="item in 8">
            <span class="mr-3 img rounded-circle bg-pink text-white font-weight-bold">T</span>
            <div class="grow bb-eee pb-2">
              <div>Jonh sall</div>
              <div class="text-muted">designer</div>
            </div>
          </a>
        </div>
      </div>
      <div class="bt-l bg-light p-2">
        <span class="text-muted">Manage: </span>
        <a class="btn bg-skyblue text-white rounded-circle btn-icon"><i class="fa fa-facebook"></i></a>
        <a class="btn bg-lightgreen text-white rounded-circle btn-icon"><i class="fa fa-linkedin"></i></a>
        <a class="btn bg-pink text-white rounded-circle btn-icon"><i class="fa fa-twitter"></i></a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'appQuickview',
  data: () => ({
    colors: ['success', 'info', 'danger', 'primary', 'warning', '']
  }),
  methods: {
    close () {
      this.$el.classList.remove('app-quickview-show')
    }
  }
}
</script>

<style lang="scss">
  .app-quickview {
    transition: transform .45s cubic-bezier(.25, .8, .25, 1);
    transform: translateX(100%);
    position: fixed;
    height: auto;
    z-index: 21;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    &.app-quickview-show { transform: translateX(0) }
    .app-quickview-wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 300px;
      background-color: #fff;
      box-shadow: 0 0 9px rgba(191, 191, 191, .36)
    }
  }
</style>
