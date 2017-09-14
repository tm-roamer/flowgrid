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
        this.width = node.w * opt.cellW - opt.padding.left - opt.padding.right;
        this.height = node.h * opt.cellH - opt.padding.top - opt.padding.bottom;
        return {
          transform: "translate(" + (node.x * opt.cellW + 2 * opt.padding.left) + "px,"
                  + (node.y * opt.cellH + 2 * opt.padding.top) + "px)",
          width: this.width + 'px',
          height: this.height + 'px'
        }
      }
    },
    data () {
      return {
        placeholder: false,
        width: 0,
        height: 0
      }
    }
  }
</script>

<style>
</style>
