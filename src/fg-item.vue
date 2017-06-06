<template>
  <div class="fg-item" :style="itemStyle">
    <div class="fg-item-content">
      <slot></slot>
    </div>
    <div class="fg-item-zoom-bar"></div>
  </div>
</template>

<script>
  // import {CONSTANT, globalConfig} from './config';
  // import utils from './utils';
  // import handleEvent from './event';
  // import dragdrop from './dragdrop';
  // import view from './view';
  // import Flowgrid from './api';

//  FG_ITEM_ANIMATE: 'fg-item-animate',             // 拖拽块classname 动画效果
//    FG_ITEM_GRAG_DROP: 'fg-item-dragdrop',          // 正在拖拽的块classname
//    FG_ITEM_PLACEHOLDER: 'fg-item-placeholder',     // 拖拽块的占位符
//    PLACEHOLDER: 'placeholder'                      // 占位符

  export default {
    name: 'fg-item',
    props: [
      'node', // {id:'2', x: 0, y: 0, w: 4, h: 4}
    ],
    computed: {
      itemStyle: function () {
        let opt = this.$parent.options;
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
      // console.log('2222');
    }
  }
</script>

<style>
  .abcd {
    color: red;
  }
</style>
