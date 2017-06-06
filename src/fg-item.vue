<template>
  <div class="fg-item">
    <div class="fg-item-content">
      <slot></slot>
    </div>
    <div class="fg-item-zoom-bar"></div>
  </div>
</template>

<script>
  // import {CONSTANT, globalConfig} from './config';
   import cache from './cache';
  // import utils from './utils';
  // import handleEvent from './event';
  // import dragdrop from './dragdrop';
  // import view from './view';
  // import Flowgrid from './api';

  function instance(options, container, originalData) {
    // 初始化监听, 单例, 仅绑定一次
    handleEvent.init(true, document.body);
    // 判断容器
    if (!container)
      container = document.querySelector('.' + CONSTANT.FG_LAYOUT);
    else if (typeof jQuery === "object" && container instanceof jQuery)
      container = container[0];
    // 设置编号
    var index = ++cache.count;
    if (!container.getAttribute(CONSTANT.FG_LAYOUT_INDEX)) {
      container.setAttribute(CONSTANT.FG_LAYOUT_INDEX, index);
    }
    cache[index] = new Flowgrid(options, container, originalData);
    return cache[index];
  }

  // 销毁实例
  function destroy(flowgrid) {
    delete cache[flowgrid.opt.container.getAttribute(CONSTANT.FG_LAYOUT_INDEX)];
    flowgrid.destroy();
    flowgrid = null;
  }

  export default {
    data () {
      return {
      }
    }
  }
</script>

<style>
  .abcd {
    color: red;
  }
</style>
