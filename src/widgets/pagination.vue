<template>
  <div v-if="page.pageNumbers && page.pageNumbers.length > 1" class="pagination">
    <a class="page-link" :class="{active: page.pageNumber == no}" @click="paging(no)" :key="idx" v-for="(no, idx) in page.ellipsisPageNumbers" v-text="no || '...'"></a>
    <form @submit.prevent="paging(0, $event)" v-if="page.lastPageNumber > 50">
      <input title="指定页码" maxlength="3" ref="input">
      <button class="page-link">Go!</button>
    </form>
    <select title="分页大小" @change="change" v-if="sizes">
      <option :value="size" :key="size" v-for="size in sizes">{{size}}</option>
    </select>
  </div>
  <div v-else-if="page.totalCount == 0" class="pagination text-grey">没有找到记录...</div>
</template>

<script>
export default {
  name: 'pagination',
  props: {
    page: { // 分页对象
      type: Object,
      requried: true
    },
    sizes: [Array, Boolean]
  },
  methods: {
    paging (pageno, jump) {
      if (jump) {
        pageno = this.$refs.input.value || 0
      }
      if (pageno === this.page.pageNumber || pageno === 0) { // 点击当前页或略过页(页数为0表示略过页)时,不触发分页事件
        return
      }
      this.$emit('paging', pageno, this.page.pageSize)
    },
    change (e) {
      this.$emit('paging', this.page.pageNumber, e.target.value)
    }
  }
}
</script>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .pagination select, .pagination input {
    border: 1px solid #E6E6E6;
    border-radius: 3px;
    text-align: center;
    padding: .125rem .5rem;
    margin: 0 .5rem;
    outline: none;
  }
  .pagination input { width: 3rem }
  .page-link {
    border-radius: .25rem;
    margin-right: .25rem;
    line-height: 1.25;
    font-size: .9375rem;
    padding: .45rem .9rem;
    background: none;
    cursor: pointer;
    border: none;
  }
  .page-link:hover, .page-link.active {
    background-color: #eceeef;
    outline: none;
  }
</style>
