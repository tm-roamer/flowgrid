(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.flowgrid = factory());
}(this, (function () { 'use strict';

var version = "1.2.1";

// 全局配置
var globalConfig = {
  row: 7, // 网格布局的默认行,默认7行
  col: 12, // 网格布局的默认列,默认12列
  distance: 5, // 触发拖拽的拖拽距离,默认5px
  draggable: true, // 是否允许拖拽, 默认允许
  resizable: true, // 是否允许缩放, 默认允许
  nodeMinW: 2, // 节点块的最小宽度, 默认占2格
  nodeMinH: 2, // 节点块的最小高度, 默认占2格
  overflow: 5, // 当拖拽或缩放超出网格容器的溢出像素
  padding: { // 节点块之间的间距, 默认都为5px
    top: 5,
    left: 5,
    right: 5,
    bottom: 5
  },
  cellScale: { // 单元格的宽高比例, 默认16:9
    w: 16,
    h: 9
  },
  addNodeSize: { // 添加节点的默认尺寸
    x: 0,
    y: 0,
    w: 2,
    h: 2
  }
};

var fgContainer = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-container", class: { 'fg-no-draggable': !_vm.opt.draggable, 'fg-no-resizable': !_vm.opt.resizable } }, [_c('div', { staticClass: "fg-layout" }, [_vm._t("default"), _vm._v(" "), _c('div', { staticClass: "fg-item-dragdrop" })], 2)]);
  },
  staticRenderFns: [],
  name: 'fg-container',
  props: ['setting', 'nodes'],
  computed: {
    opt: function opt() {
      var options = Object.assign({}, globalConfig, this.setting || {});
      this.computeCell(options);
      return options;
    }
  },
  data: function data() {
    return {
      area: []
    };
  },

  methods: {
    // 计算单元格
    computeCell: function computeCell(opt) {
      opt.cellW = opt.containerW / opt.col;
      opt.cellH = opt.cellW / opt.cellScale.w * opt.cellScale.h;
      opt.cellW_Int = Math.floor(opt.cellW);
      opt.cellH_Int = Math.floor(opt.cellH);
    },
    init: function init() {
      this.buildArea();
    },
    // 构建网格区域
    buildArea: function buildArea() {
      var max = this.getMaxRowAndCol();
      for (var r = 0; r < max.row; r++) {
        this.area[r] = new Array(max.col);
      }
      this.putNodes();
    },
    // 取得区域中的最大行和列
    getMaxRowAndCol: function getMaxRowAndCol() {
      var opt = this.opt;
      var nodes = this.nodes;
      var max = {
        row: opt.row,
        col: opt.col
      };
      if (nodes && nodes.length > 0) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var n = _step.value;

            if (n.y + n.h > max.row) {
              max.row = n.y + n.h;
            }
            if (n.x + n.w > max.col) {
              max.col = n.x + n.w;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
      return max;
    },
    // 将数据铺进网格布局
    putNodes: function putNodes() {
      var r = void 0,
          c = void 0,
          rlen = void 0,
          clen = void 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var node = _step2.value;

          for (r = node.y, rlen = node.y + node.h; r < rlen; r++) {
            for (c = node.x, clen = node.x + node.w; c < clen; c++) {
              this.area[r][c] = node.id;
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    },
    // 自动扫描空位添加节点
    getNodeCoord: function getNodeCoord(node) {
      var nodes = this.nodes;
      var area = this.area;
      if (nodes.length === 0) return node;
      var r,
          c,
          maxCol = area[0].length;
      for (r = 0; r < area.length; r = r + 1) {
        node.y = r;
        for (c = 0; c < area[0].length; c = c + 1) {
          node.x = c;
          if (node.x + node.w > maxCol) {
            node.x = 0;
          }
          if (!this.collision(area, node)) return node;
        }
      }
      node.x = 0; // area区域都占满了, 另起一行
      node.y = r;
      return node;
    },
    // 碰撞检测
    collision: function collision(area, node) {
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
    }
  },
  created: function created() {
    // 早于 fg-item mounted 方法执行
    this.init();
  },
  beforeUpdate: function beforeUpdate() {
    // 数据发送更新, 重置区域
    this.buildArea();
    //console.log(this);
  },
  updated: function updated() {
    //console.log(this);
  },
  mounted: function mounted() {
    //console.log('mounted');
  }
};

var fgItem = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-item", style: _vm.itemStyle }, [_c('div', { staticClass: "fg-item-content" }, [_vm._t("default")], 2), _vm._v(" "), _c('div', { staticClass: "fg-item-zoom-bar" })]);
  },
  staticRenderFns: [],
  name: 'fg-item',
  props: ['node'],
  computed: {
    itemStyle: function itemStyle() {
      var opt = this.$parent.opt;
      var node = this.node;
      return {
        transform: "translate(" + node.x * opt.cellW_Int + "px," + node.y * opt.cellH_Int + "px)",
        width: node.w * opt.cellW_Int - opt.padding.left - opt.padding.right + 'px',
        height: node.h * opt.cellH_Int - opt.padding.top - opt.padding.bottom + 'px'
      };
    }
  },
  data: function data() {
    return {};
  },
  mounted: function mounted() {
    // console.log(this.$parent.options);
    console.log('2222');
  }
};

var index = {
	version: version,
	fgContainer: fgContainer,
	fgItem: fgItem
};

return index;

})));
//# sourceMappingURL=flowgrid.js.map
