<template>
  <div class="fg-item" :style="itemStyle" :fg-id="node.id">
    <div class="fg-item-content">
      <slot></slot>
    </div>
    <div class="fg-item-zoom-bar" :fg-id="node.id"></div>
  </div>
</template>

<script>

  import {CONSTANT} from './config'

  export default {
    name: 'fg-item',
    props: [
      'node', // {id:'2', x: 0, y: 0, w: 4, h: 4}
      'index'
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
      }
    },
    mounted () {
      // console.log(this.$parent.options);
//       console.log('2222');
    }
  }
</script>

<style>
</style>
