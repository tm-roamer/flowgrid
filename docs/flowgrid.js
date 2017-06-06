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
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-container", class: { 'fg-no-draggable': !_vm.options.draggable, 'fg-no-resizable': !_vm.options.resizable } }, [_c('div', { staticClass: "fg-layout" }, [_vm._t("default"), _vm._v(" "), _c('div', { staticClass: "fg-item-dragdrop" })], 2)]);
  },
  staticRenderFns: [],
  name: 'fg-container',
  props: ['setting', 'nodes'],
  computed: {
    options: function options() {
      var opt = Object.assign({}, globalConfig, this.setting || {});
      // 计算单元格的尺寸
      opt.cellW = opt.containerW / opt.col;
      opt.cellH = opt.cellW / opt.cellScale.w * opt.cellScale.h;
      opt.cellW_Int = Math.floor(opt.cellW);
      opt.cellH_Int = Math.floor(opt.cellH);
      return opt;
    }
  },
  data: function data() {
    return {
      area: []
    };
  },

  methods: {
    // 自动扫描空位添加节点
    addNode: function addNode(area, data, node) {
      //        if (data.length === 0) return node;
      //        var r, c, maxCol = area[0].length;
      //        for (r = 0; r < area.length; r = r + 1) {
      //          node.y = r;
      //          for (c = 0; c < area[0].length; c = c + 1) {
      //            node.x = c;
      //            if (node.x + node.w > maxCol) {
      //              node.x = 0;
      //            }
      //            if (!this.collision(area, node))
      //              return node;
      //          }
      //        }
      //        node.x = 0;  // area区域都占满了, 另起一行
      //        node.y = r;
      this.$emit('addnode', { x: 0 });
    }
  },
  mounted: function mounted() {
    this.addNode();
    // let el = this.$el;
    // let opt = this.options;
    // console.log(this.$el.clientWidth, this.$el.clientHeight);
    // opt.containerH = el.clientHeight;
    // opt.containerW = el.clientWidth;
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
      var opt = this.$parent.options;
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
    // console.log('2222');
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
