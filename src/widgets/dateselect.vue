<template>
  <div class="row">
    <div class="col">
      <select v-model="birth[0]" class="form-control" ref="0" @change="birthChange($event, 0)" title="年">
        <option value="">年</option>
        <option :key="val" :value="currentYear - val" v-for="val in 60">{{currentYear - val}}</option>
      </select>
    </div>
    <div class="col">
      <select v-model="birth[1]" class="form-control" ref="1" @change="birthChange($event, 1)" title="月">
        <option value="">月</option>
        <option :key="val" :value="val" v-for="val in 12">{{val}}</option>
      </select>
    </div>
    <div class="col">
      <select v-model="birth[2]" class="form-control" ref="2" @change="birthChange($event, 2)" title="日">
        <option value="">日</option>
        <option :key="val" :value="val" v-for="val in days">{{val}}</option>
      </select>
    </div>
  </div>
</template>
<!--
  日期选择控件, 三个下拉框实现的年-月-日选择
-->
<script>
export default {
  name: 'dateSelect',
  data: () => ({
    currentYear: new Date().getFullYear(),
    birth: ['', '', '']
  }),
  props: ['value'],
  methods: {
    birthChange (e, index) {
      var value = e.target.value
      if (value) {
        e.target.dataset.prev = value
        this.birth.forEach((n, i) => { // 检查所有日期组成部分, 非当前操作且没有值的目标
          if (i === index || this.birth[i]) {
            return false
          }
          this.birth[i] = this.$refs[i].options[1].value  // 赋默认值
        })
      } else {
        this.birth[index] = e.target.dataset.prev
      }
      this.prev = this.birth.join('-')
      this.$emit('input', this.prev)
    }
  },
  watch: {
    value (val, old) {
      var date = new Date(val)
      if (val == this.prev) {
        if (this.birth[2] > this.days) {
          this.birth[2] = this.days
        }
        return
      }
      this.birth = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    }
  },
  computed: {
    days () {
      if (this.birth[0] && this.birth[1]) {
        return new Date(this.birth[0], this.birth[1], 0).getDate()
      }
      return 31
    }
  }
}
</script>
