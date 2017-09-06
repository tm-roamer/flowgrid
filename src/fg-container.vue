<template>
  <div class="fg-container">
    <div class="fg-layout"
         :index="index"
         :class="{'fg-no-draggable': !opt.draggable, 'fg-no-resizable': !opt.resizable}">
      <slot></slot>
      <!-- 跟随鼠标移动的拖拽节点 -->
      <div class="fg-item-dragdrop" v-show="isDrag"></div>
    </div>
  </div>
</template>

<script>

  import {globalConfig} from './config'
  import cache from './cache'
  import handleEvent from './event'

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
        isDrag: false,
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
        handleEvent.init(true, this.opt);
        // 缓存对象
        cache.init();
        this.index = cache.set(this);
        this.load();
      },
      load: function() {
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
      // 碰撞检测, 从左到右, 从上到下扫描
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
      },
      // 碰撞检测, 两个矩形是否发生碰撞
      checkHit: function (n, node) {
        var result = false;
        if ((n.x + n.w > node.x) && (n.x < node.x + node.w)) {
          if ((n.y + n.h > node.y) && (n.y < node.y + node.h)) {
            result = true;
          }
        }
        return result;
      },
      // 节点重叠, 拖拽节点过程中, 将所有节点坐标重新计算
      overlap: function (node, dx, dy, isResize) {
        var nodes = this.nodes,
          dx = dx || 0,
          dy = dy || 0,
          offsetNode = null,
          offsetUnderY = 0,
          offsetUpY = 0,
          isResize = isResize || false,
          checkHit = this.checkHit;
        // 向下, 向左, 向右插入节点
        if (!isResize) {
          for(let n of nodes) {
            if (n !== node && checkHit(n, node)) {
              var val = n.y + n.h - node.y;
              if (val > offsetUnderY) {
                offsetUnderY = val;
                offsetNode = n;
              }
            }
          }
          if (offsetNode) {
            // 判断插入点应该上移还是下移, 通过重叠点的中间值h/2来判断
            var median = offsetNode.h / 2 < 1 ? 1 : Math.floor(offsetNode.h / 2);
            // 计算差值, 与中间值比较, dy > 2 下移(2是优化, 防止平移上下震动), 拿y+h来和中间值比较
            var difference = (dy >= 2 && dy >= dx) ? node.y + node.h - offsetNode.y : node.y - offsetNode.y;
            // 大于中间值, 求出下面那部分截断的偏移量, 等于是怕上下顺序连续的块,会错过互换位置
            if (difference >= median) {
              node.y = node.y + offsetUnderY;
            }
          }
        }
        // 向上插入节点
        for(let n of nodes) {
          if (n !== node && checkHit(n, node)) {
            var val = node.y - n.y;
            offsetUpY = val > offsetUpY ? val : offsetUpY;
          }
        }
        // 重新计算y值
        for(let n of nodes) {
          if (n !== node) {
            if ((n.y < node.y && node.y < n.y + n.h) || node.y <= n.y) {
              n.y = n.y + node.h + offsetUpY;
            }
          }
        }
        return this;
      },

      // 回调函数, 开始拖拽
      dragStart: function (item) {
        this.$emit('dragStart', this, item);
      },
      // 回调函数, 正在拖拽
      drag: function(item) {
        this.$emit('drag', this, item);
      },
      // 回调函数, 结束拖拽
      dragEnd: function (item) {
        this.$emit('dragEnd', this, item);
      },
      // 回调函数, 开始缩放
      resizeStart: function (item) {
        this.$emit('resizeStart', this, item);
      },
      // 回调函数, 正在拖拽
      resize: function(item) {
        this.$emit('resize', this, item);
      },
      // 回调函数, 结束缩放
      resizeEnd: function (item) {
        this.$emit('resizeEnd', this, item);
      }
    },
    created () {
      // 早于fg-item的钩子mounted执行
      this.init();
    },
    beforeUpdate () {
      // 数据即将更新时重置区域, 并应用布局
      this.load();
    },
    updated () {},
    mounted () {},
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

  /* 插件外容器的样式 */
  .fg-container {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  /* 网络布局的外容器 */
  .fg-layout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* 当禁止缩放, 隐藏缩放句柄 */
  .fg-layout.fg-no-resizable .fg-item-zoom-bar {
    display: none;
  }

  /* 当禁用缩放或者拖拽, 恢复鼠标形状 */
  .fg-layout.fg-no-draggable .fg-item,
  .fg-layout.fg-no-resizable .fg-item {
    cursor: default;
  }

  /* 节点块的样式 */
  .fg-item {
    cursor: pointer;
    position: absolute;
    z-index: 10;
    background-color: rgb(19, 19, 19);
    color:rgba(255,255,255,0.7);
  }

  /* 节点块的动画样式 */
  .fg-item-animate {
    -webkit-transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
    transition: transform 0.2s, height 0.2s, width 0.2s;
  }

  /* 拖拽过程中, 被拖拽的当前节点块补充占位样式 */
  .fg-item-placeholder {
    z-index: 1;
  }
  .fg-item-placeholder::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:rgba(64, 108, 176, 0.3);
    z-index: 2;
  }

  /* 拖拽过程中, 被拖拽的节点 */
  .fg-item-dragdrop {
    position: absolute;
    z-index: 100;
    box-shadow: 2px 2px 2px rgba(144, 142, 142, 0.6);
    opacity: 0.8;
    background-color: rgb(19, 19, 19);
  }

  /* 节点块的内容区 */
  .fg-item-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* 节点块的缩放句柄 */
  .fg-item-zoom-bar {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 24px;
    width: 24px;
    overflow: hidden;
    z-index: 1;
    cursor: se-resize;
  }
  .fg-item-zoom-bar:before {
    content: "";
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: #20a0ff;
  }

</style>
