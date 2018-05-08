<template>
  <div class="app-search" @click.self="close">
    <div class="app-search-wrapper">
      <div class="container">
        <div class="my-3">
          <div class="input-holder append bg-light rad-30">
            <i class="ti-search"></i>
            <input class="form-control" placeholder="查找..." autofocus>
            <i class="ti-close"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'appSearch',
  methods: {
    close () {
      this.$el.classList.remove('app-search-show')
    }
  }
}
</script>

<style lang="scss">
  .app-search {
    background-color: rgba(255, 255, 255, .75);
    transition: transform .5s cubic-bezier(.5, 1.5, .1, .8);
    transform: translateY(-100%);
    overflow: hidden;
    position: fixed;
    z-index: 21;
    height: auto;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    &.app-search-show {
      transform: translateY(0)
    }
    .app-search-wrapper {
      background-color: rgba(255, 255, 255, .9);
      box-shadow: 0 0 9px rgba(191, 191, 191, .36);
      overflow-y: auto
    }
  }
</style>
