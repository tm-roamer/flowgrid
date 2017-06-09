<template>
  <div class="fg-container"
       :fg-index="index"
       :class="{'fg-no-draggable': !opt.draggable, 'fg-no-resizable': !opt.resizable}">
    <div class="fg-layout">
      <slot></slot>
      <div class="fg-item-dragdrop"></div>
    </div>
  </div>
</template>

<script>

  import {globalConfig} from './config'
  import cache from './cache'
  import handleEvent from './event'
  import drag from './dragdrop'

  export default {
    name: 'fg-container',
    props: [
      'setting',
      'nodes'
    ],
    computed: {
      opt: function () {
        let options = Object.assign({}, globalConfig, this.setting || {});
        this.computeCell(options);
        return options;
      }
    },
    data () {
      return {
        area: [],
        index: 1,
      }
    },
    methods: {
      // 计算单元格
      computeCell: function (opt) {
        opt.cellW = opt.containerW / opt.col;
        opt.cellH = opt.cellW / opt.cellScale.w * opt.cellScale.h;
        opt.cellW_Int = Math.floor(opt.cellW);
        opt.cellH_Int = Math.floor(opt.cellH);
      },
      init: function () {
        // 初始化监听
        handleEvent.init(true);
        // 缓存对象
        cache.init();
        this.index = cache.set(this);
        // 初始矩阵区域并布局
        this.buildArea();
        this.layout();
      },
      // 构建网格区域
      buildArea: function () {
        let max = this.getMaxRowAndCol();
        for (let r = 0; r < max.row; r++) {
          this.area[r] = new Array(max.col);
        }
        this.putNodes();
      },
      // 取得区域中的最大行和列
      getMaxRowAndCol: function () {
        let opt = this.opt;
        let nodes = this.nodes;
        let max = {
          row: opt.row,
          col: opt.col
        };
        if (nodes && nodes.length > 0) {
          for (let n of nodes) {
            if (n.y + n.h > max.row) {
              max.row = n.y + n.h;
            }
            if (n.x + n.w > max.col) {
              max.col = n.x + n.w;
            }
          }
        }
        return max;
      },
      // 将数据铺进网格布局
      putNodes: function () {
        let r, c, rlen, clen;
        for (let node of this.nodes) {
          for (r = node.y, rlen = node.y + node.h; r < rlen; r++) {
            for (c = node.x, clen = node.x + node.w; c < clen; c++) {
              this.area[r][c] = node.id;
            }
          }
        }
      },
      // 自动扫描空位添加节点
      getNodeCoord: function (node) {
        let nodes = this.nodes;
        let area = this.area;
        if (nodes.length === 0) return node;
        var r, c, maxCol = area[0].length;
        for (r = 0; r < area.length; r = r + 1) {
          node.y = r;
          for (c = 0; c < area[0].length; c = c + 1) {
            node.x = c;
            if (node.x + node.w > maxCol) {
              node.x = 0;
            }
            if (!this.collision(area, node))
              return node;
          }
        }
        node.x = 0;  // area区域都占满了, 另起一行
        node.y = r;
        return node;
      },
      // 碰撞检测, 从左到右, 从上到下
      collision: function (area, node) {
        for (let r = node.y; r < node.y + node.h; r++)
          for (let c = node.x; c < node.x + node.w; c++)
            if (area[r] && (area[r][c] || area[r][c] == 0))
              return true;
      },
      // 流布局
      layout: function () {
        // 原理: 遍历数据集, 寻找节点上面是否有空行, 修改node.y, 进行上移.
        for (let node of this.nodes) {
          let y = this.findEmptyLine(node);
          node.y > y && this.moveUp(node, y);
        }
      },
      // 寻找空行, 扫描找到最接近顶部的空行是第几行
      findEmptyLine: function (node) {
        let r, c, cell, area = this.area;
        for (r = node.y - 1; r >= 0; r--) {
          for (c = node.x; c < node.x + node.w; c++) {
            cell = area[r][c];
            if (cell || cell == 0) {
              return r + 1;
            }
          }
        }
        return 0;
      },
      // 上移
      moveUp: function (node, newRow, newId) {
        node.y = newRow;
        newId && (node.id = newId)
        for (let r = node.y; r < node.y + node.h; r++)
          for (let c = node.x; c < node.x + node.w; c++)
            this.area[r][c] = node.id;
      }
    },
    created () {
      // 早于fg-item的钩子mounted执行
      this.init();
    },
    beforeUpdate () {
      // 数据更新时重置区域, 并布局
      this.buildArea();
      this.layout();
      //console.log(this);
    },
    updated () {
      //console.log(this);
    },
    mounted () {
      //console.log('mounted');
    },
    destroyed () {
      handleEvent.destroy();
    }
  }
</script>

<style>

  /* 拖拽过程中阻止文本选中 */
  body.fg-user-select-none {
    user-select: none !important;
  }

  /* 响应式 */
  @media screen and (max-width: 767px) {
    .fg-layout {
      width: auto !important;
      margin: 0 10px;
    }

    .fg-layout:after {
      content: "";
      clear: both;
    }

    .fg-layout .fg-item-zoom-bar {
      display: none;
    }

    .fg-item {
      position: static;
      width: 100% !important;
      height: auto !important;
      float: left !important;
      transform: translate(0, 0) !important;
      margin-bottom: 10px;
    }
  }

  .fg-container {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .fg-layout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .fg-layout.fg-no-resizable .fg-item-zoom-bar {
    display: none;
  }

  .fg-layout.fg-no-draggable .fg-item,
  .fg-layout.fg-no-resizable .fg-item {
    cursor: default;
  }

  .fg-item {
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    position: absolute;
    z-index: 10;
    background-color: #8fee2b;
  }

  .fg-item-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .fg-item-zoom-bar {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 24px;
    width: 24px;
    overflow: hidden;
    z-index: 2147483647;
    cursor: se-resize;
  }

  .fg-item-zoom-bar:before {
    content: "";
    position: absolute;
    z-index: 2147483647;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  .fg-item-dragdrop {
    box-shadow: 2px 2px 2px rgba(144, 142, 142, 0.6);
    opacity: 0.8;
    z-index: 2147483647;
  }

  .fg-item[data-fg-id="placeholder"] {
    background-color: #d3d3d3;
    z-index: 1;
  }

  .fg-item-animate {
    -webkit-transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
    transition: transform 0.2s, height 0.2s, width 0.2s;
  }
</style>
