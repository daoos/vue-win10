<template>
  <div class="p-3">
    <div class="px-3 pb-2 text-md-left">
      <span class="align-middle"><i class="fa fa-bar-chart"></i> 报表、统计</span>
    </div>
  </div>
</template>
<script>
import changelog from '../assets/changelog'

export default {
  data: () => ({
    colors: ['success', 'info', 'danger', 'primary', 'warning', ''],
    changelog,
    active: 0
  }),
  mounted () {
    this.$emit('loaded')
  }
}
</script>
