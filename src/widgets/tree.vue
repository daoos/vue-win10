<script>
// default icons
const icons = {
  default: 'fa fa-institution'
}

function closest (event, tag, until) {
  for (var p of event.path) {
    var tagName = p.tagName.toLowerCase()
    if (tagName == tag || tagName == until) {
      return p
    }
  }
  return null
}

// default fetures
export const fetures = {
  'wholerow': 1,
  'checkbox': 1,
  'multiple': 0,
  'striped': 0,
  'radio': 0,
  'dots': 0
}

export default {
  name: 'jstree',
  props: {
    value: null,
    nodes: {
      required: true,
      type: Array
    }
  },
  data: () => ({
    checked: {},
    map: {}
  }),
  methods: {
    triggerEvents () {
      var nodes = Object.values(this.checked)
      if (this.$listeners.input) {
        var keys = Object.keys(this.checked)
        var len = keys.length
        var value = len ? keys[0] : ''
        switch (typeof this.value) {
          case 'array' :
            value = keys
            break
          case 'number':
            value = len ? Number(keys[0]) : ''
            break
        }
        this.$emit('input', value)
      }
      if (this.$listeners.change) {
        this.$emit('change', nodes)
      }
    },
    selectNodes (node) {
      var exists = this.checked[node.id]
      if (exists) {
        this.$delete(this.checked, node.id)
      } else {
        if (!this.options.multiple) {
          this.checked = {}
        }
        this.$set(this.checked, node.id + '', node)
      }
      this.triggerEvents()
    }
  },
  created () {
    this.options = {}
    this.fetures = Object.keys(fetures).filter(k => {
      var on = fetures[k] || k in this.$attrs
      this.options[k] = on
      return on
    })
  },
  mounted () {
    // wholerow enabled, add hover events for toggle wholerow class
    if (this.options.wholerow) {
      var el
      this.$el.addEventListener('mouseover', function (e) {
        el = closest(e, 'li')
        el.classList.add('jstree-hover')
      })
      this.$el.addEventListener('mouseout', function () {
        // no need for query here, just use it
        el.classList.remove('jstree-hover')
      })
    }
  },
  updated () {
    this.triggerEvents()
  },
  render (h) {
    var v = this

    function mapfn (node, index, array) {
      v.map[node.id] = node                     // map node by it's id
      if (node.checked || node.id == v.value) {
        v.checked[node.id] = node
      }
      var checked = v.checked[node.id]          // should current node been checked
      var parent = node.children                // is parent
      var last = index == array.length - 1      // is last node
      var arr = []                              // children array of current node
      // wholerow

      if (v.options.wholerow) {
        arr.push(h('div', {class: 'jstree-row'}))
      }
      // toggle, try these: ▶►▷◁◀◄
      arr.push(h('svg', {class: 'jstree-icon jstree-ocl', attrs: {viewBox: '0 -150 940 1324', xmlns: 'http://www.w3.org/2000/svg'}}, [
        h('path', {attrs: {d: 'M635.31088 512q0 14.848-10.848 25.728l-256 256q-10.848 10.848-25.728 10.848t-25.728-10.848-10.848-25.728l0-512q0-14.848 10.848-25.728t25.728-10.848 25.728 10.848l256 256q10.848 10.848 10.848 25.728z'}})
      ]))
      // anchor sub elements
      var sub = []
      // checkbox
      sub.push(h('input', {class: 'jstree-check', attrs: {type: 'checkbox', value: node.id, checked}}))
      sub.push(h('i', {class: 'jstree-icon'}))
      // icon
      sub.push(h('i', {class: 'jstree-icon jstree-themeicon ' + (node.icon || icons.default)}))
      // name
      sub.push(v._v(node.name))
      arr.push(h('a', {class: 'jstree-anchor'}, sub))
      // children
      if (parent) {
        arr.push(h('ul', node.children.map(mapfn)))
      }
      return h('li', {
        class: ['jstree-node',
          parent ? 'jstree-parent' : 'jstree-leaf',
          checked ? 'jstree-checked' : '',
          node.opened ? 'jstree-open' : '',
          last ? 'jstree-last' : ''
        ],
        on: {
          click (e) {
            var target = e.target
            if (/svg|path/i.test(target.tagName)) {        // click inside the svg icon
              node.opened = !node.opened                   // toggle open state
            } else {
              v.selectNodes(node)
            }
            e.stopPropagation()
          }
        }
      }, arr)
    }

    return h('ul', {class: 'jstree-root-ul' + ' jstree-' + this.fetures.join(' jstree-')}, this.nodes.map(mapfn))
  }
}
</script>

<style lang="scss">
  /* variables */
  $hover-bg-color: rgba(95, 190, 170, 0.2);
  $active-bg-color: rgba(95, 190, 170, 0.4);
  $hover-shadow-color: #ccc;
  $active-shadow-color: #999;
  $disabled-bg-color: #efefef;
  $disabled-color: #666;
  $size: 1.5rem;
  // sizing
  .jstree-node {
    line-height: $size;
    min-height: $size;
    min-width: $size
  }
  .jstree-anchor,
  .jstree-icon {
    line-height: $size;
    height: $size
  }
  .jstree-anchor { height: $size }
  .jstree-icon { width: $size }
  // ul
  .jstree-root-ul {
    position: relative;
    list-style: none;
    padding: 0;
    margin: 0;
    ul {
      padding-left: $size;
      list-style: none;
      display: none;
    }
  }
  .jstree-node { white-space: nowrap }
  .jstree-anchor, .jstree-icon {
    text-decoration: none;
    vertical-align: top;
    position: relative;
    padding: 0;
    margin: 0;
  }
  .jstree-anchor {
    display: inline-flex;
    align-items: center;
    padding: 0 .25rem 0 .0625rem;
    white-space: nowrap;
    cursor: pointer;
    color: inherit;
    outline: 0;
  }
  .jstree-anchor:hover,
  .jstree-hover > .jstree-row {
    background: $hover-bg-color
  }
  .jstree-checked {
    > .jstree-anchor,
    > .jstree-row { background: $active-bg-color }
  }
  .jstree-icon { display: inline-block; text-align: center }
  .jstree-ocl {
    transition: transform .2s, fill .2s;
    visibility: hidden;
    cursor: pointer;
    fill: transparent;
    stroke-linejoin: round;
    stroke-width: 1rem;
    stroke: #000;
  }
  .jstree-loading > .jstree-ocl {
    background: url('data:image/gif;base64,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') center no-repeat
  }
  .jstree-leaf > .jstree-ocl { cursor: default }
  .jstree-open > .jstree-ocl {
    transform: rotate(45deg);
    fill: currentColor
  }
  .jstree-parent {
    > .jstree-ocl { visibility: visible }
    &.jstree-open > ul { display: block }
  }
  .jstree-themeicon { margin-right: 2px }
  .jstree-no-icons .jstree-themeicon { display: none }
  .jstree-animated,
  .jstree-anchor,
  .jstree-row {
    transition: background-color 0.15s, box-shadow 0.15s
  }
  // disabled
  .jstree-disabled {
    color: $disabled-color;
    > .jstree-anchor,
    > .jstree-hover,
    > .jstree-row {
      background: $disabled-bg-color;
      cursor: default;
    }
    > .jstree-icon {
      opacity: 0.8
    }
  }
  // ellipsis
  .jstree-ellipsis {
    overflow: hidden;
    &.jstree-no-icons .jstree-anchor {width: calc(100% - 5px)}
    .jstree-anchor {
      width: calc(100% - (#{$size} + 5px));
      text-overflow: ellipsis;
      overflow: hidden
    }
  }
  // checkboxes
  .jstree-check {
    display: none;
    &:checked + i {border: 1px solid currentColor}
    &:disabled + i { opacity: .3 }
    & + i {
      display: none;
      border-radius: .125rem;
      border: .0625rem solid #bbb;
      transition: all .2s;
      position: relative;
      cursor: pointer;
      height: $size - .5rem;
      width: $size - .5rem;
      margin: .25rem;
    }
    & + i:hover { border-color: currentColor }
    & + i:after {
      transition: background .2s;
      position: absolute;
      content: '';
      left: 50%;
      top: 50%
    }
  }
  .jstree-checkbox {
    .jstree-check + i { display: inline-block }
    .jstree-check + i:after {
      border: solid transparent;
      border-radius: 1px;
      border-width: 0 .125rem .125rem 0;
      transform: rotate(45deg) translate(-110%, -25%);
      height: .7rem;
      width: .4rem;
    }
    .jstree-check:checked + i:after {border-color: currentColor}
  }
  .jstree-radio {
    .jstree-check + i { display: inline-block; border-radius: 20px }
    .jstree-check:checked + i:after {
      transform: translate(-50%, -50%);
      background: currentColor;
      border-radius: 50%;
      padding: .25rem
    }
  }
  // wholerow
  .jstree-wholerow {
    display: inline-block;
    min-width: 100%;
    .jstree-row {
      position: absolute;
      user-select: none;
      cursor: pointer;
      height: $size;
      width: 100%;
      left: 0;
    }
    .jstree-checked > .jstree-anchor,
    .jstree-anchor:hover { background: none }
  }
  // stripes
  .jstree-striped {
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAkCAMAAAB/qqA+AAAABlBMVEUAAAAAAAClZ7nPAAAAAnRSTlMNAMM9s3UAAAAXSURBVHjajcEBAQAAAIKg/H/aCQZ70AUBjAATb6YPDgAAAABJRU5ErkJggg==");
    background-size: auto ($size * 2)
  }
</style>
