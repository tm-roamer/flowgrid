<template>
  <div class="fg-container"
       :class="{'fg-no-draggable': !opt.draggable, 'fg-no-resizable': !opt.resizable}">
    <div class="fg-layout">
      <slot></slot>
      <div class="fg-item-dragdrop"></div>
    </div>
  </div>
</template>

<script>

  // 全局配置
  let globalConfig = {
    row: 7,                                            // 网格布局的默认行,默认7行
    col: 12,                                           // 网格布局的默认列,默认12列
    distance: 5,                                       // 触发拖拽的拖拽距离,默认5px
    draggable: true,                                   // 是否允许拖拽, 默认允许
    resizable: true,                                   // 是否允许缩放, 默认允许
    nodeMinW: 2,                                       // 节点块的最小宽度, 默认占2格
    nodeMinH: 2,                                       // 节点块的最小高度, 默认占2格
    overflow: 5,                                       // 当拖拽或缩放超出网格容器的溢出像素
    padding: {                                         // 节点块之间的间距, 默认都为5px
      top: 5,
      left: 5,
      right: 5,
      bottom: 5
    },
    cellScale: {                                       // 单元格的宽高比例, 默认16:9
      w: 16,
      h: 9
    },
    addNodeSize: {                                     // 添加节点的默认尺寸
      x: 0,
      y: 0,
      w: 2,
      h: 2
    }
  }

  let core = {
    // 流布局
    layout: function (area, data) {
      var i, len, r, node;
      // 原理: 遍历数据集, 碰撞检测, 修改node.y, 进行上移.
      for (i = 0, len = data.length; i < len; i++) {
        node = data[i];
        r = this.findEmptyLine(area, node);
        if (node.y > r) {
          this.moveUp(area, node, r);
        }
      }
      return this;
    },
    // 寻找空行
    findEmptyLine: function (area, node) {
      var r, c, len, cell;
      // 扫描, 找到最接近顶部的空行是第几行
      for (r = node.y - 1; r >= 0; r--) {
        for (c = node.x, len = node.x + node.w; c < len; c++) {
          cell = area[r][c];
          if (cell || cell == 0) {
            return r + 1;
          }
        }
      }
      return 0;
    },
    // 上移
    moveUp: function (area, node, newRow) {
      this.replaceNodeInArea(area, node);
      var r, c, rlen, clen;
      node.y = newRow;
      for (r = node.y, rlen = node.y + node.h; r < rlen; r++)
        for (c = node.x, clen = node.x + node.w; c < clen; c++)
          area[r][c] = node.id;
    },
    // 替换区域中的节点
    replaceNodeInArea: function (area, node, id) {
      var r, c, rlen, clen;
      for (r = node.y, rlen = node.y + node.h; r < rlen; r++)
        for (c = node.x, clen = node.x + node.w; c < clen; c++)
          area[r] && (area[r][c] = id);
      return this;
    },
    load: function () {
      var maxRowAndCol = this.getMaxRowAndCol(opt, data);
      // 重绘
      this.sortData(data)
        .buildArea(area, maxRowAndCol.row, maxRowAndCol.col)
        .putData(area, data)
        .layout(area, data);
      view.render(data, elements, opt.container, this);
    },
  }

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
        area: []
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
        this.buildArea();
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
      // 碰撞检测
      collision: function (area, node) {
        var r, c, rlen, clen;
        // 从左到右, 从上到下
        for (r = node.y, rlen = node.y + node.h; r < rlen; r++) {
          for (c = node.x, clen = node.x + node.w; c < clen; c++) {
            if (area[r] && (area[r][c] || area[r][c] == 0)) {
              return true;
            }
          }
        }
        return false;
      },
    },
    created () {
      // 早于 fg-item mounted 方法执行
      this.init();
    },
    beforeUpdate () {
      // 数据更新时重置区域
      this.buildArea();
      //console.log(this);
    },
    updated () {
      //console.log(this);
    },
    mounted () {
      //console.log('mounted');
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
