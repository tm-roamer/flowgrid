<template>
  <div class="fg-item fg-item-animate"
       :class="{'fg-item-placeholder': placeholder}"
       :style="itemStyle"
       :fg-id="node.id"
       :index="index">
    <div class="fg-item-content">
      <slot></slot>
    </div>
    <div class="fg-item-zoom-bar" :fg-id="node.id" :index="index"></div>
  </div>
</template>

<script>

  export default {
    name: 'fg-item',
    props: [
      'node', // {id:'2', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2}
      'index' // node在nodes中的索引值
    ],
    computed: {
      itemStyle: function () {
        let opt = this.$parent.opt;
        let node = this.node;
        return {
          transform: "translate(" + (node.x * opt.cellW_Int) + "px," + (node.y * opt.cellH_Int) + "px)",
          width: (node.w * opt.cellW_Int - opt.padding.left - opt.padding.right) + 'px',
          height: (node.h * opt.cellH_Int - opt.padding.top - opt.padding.bottom) + 'px'
        }
      }
    },
    data () {
      return {
        placeholder: false
      }
    },
    mounted () {}
  }
</script>

<style>
</style>
