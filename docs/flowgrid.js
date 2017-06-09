(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.flowgrid = factory());
}(this, (function () { 'use strict';

var version = "1.2.1";

// 常量
var CONSTANT = {
	THROTTLE_TIME: 15, // 节流函数的间隔时间单位ms, FPS = 1000 / THROTTLE_TIME
	USER_SELECT_NONE: 'fg-user-select-none', // 绑定到body, 阻止拖拽过程中文本选中
	FG_CONTAINER: 'fg-container', // 拖拽容器classname
	FG_LAYOUT: 'fg-layout', // 拖拽容器的布局区classname
	FG_LAYOUT_DRAGGABLE: 'data-fg-draggable', // 布局区拖拽属性
	FG_LAYOUT_RESIZABLE: 'data-fg-resizable', // 布局区缩放属性
	FG_LAYOUT_INDEX: 'data-fg-index', // 布局区编号
	FG_ITEM: 'fg-item', // 拖拽块classname
	FG_ITEM_ANIMATE: 'fg-item-animate', // 拖拽块classname 动画效果
	FG_ITEM_CONTENT: 'fg-item-content', // 拖拽块的展示内容区div的classname
	FG_ITEM_ZOOM_BAR: 'fg-zoom-bar', // 拖拽块内部放大缩小div的classname
	FG_ITEM_ZOOM_BAR_ICO: 'fg-zoom-bar-ico', // 拖拽块内部放大缩小div里面图标的classname
	FG_ITEM_DRAG_BAR: 'fg-drag-bar', // 拖拽块可以进行拖拽div的classname
	FG_ITEM_DRAG_BAR_ICO: 'fg-drag-bar-ico', // 拖拽块可以进行拖拽div里面图标的classname
	FG_ITEM_GRAG_DROP: 'fg-item-dragdrop', // 正在拖拽的块classname
	FG_ITEM_PLACEHOLDER: 'fg-item-placeholder', // 拖拽块的占位符
	FG_ITEM_DATA_ID: 'data-fg-id', // 拖拽块的数据标识id
	PLACEHOLDER: 'placeholder' // 占位符


	// 全局配置
};var globalConfig = {
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

// 缓存对象
var cache$1 = {
	init: function init() {
		if (!this.arr) this.arr = [];
	},
	get: function get(idx) {
		// 避免0的情况, if条件判断麻烦
		return this.arr[idx - 1];
	},
	set: function set(obj) {
		this.arr.push(obj);
		return this.index();
	},
	remove: function remove(index) {
		this.arr.splice(index, 1);
	},
	index: function index() {
		return this.arr.length;
	},
	list: function list() {
		return this.arr;
	}
};

var utils = {
	// 节流函数
	throttle: function throttle(now) {
		var time = new Date().getTime();
		this.throttle = function (now) {
			if (now - time > CONSTANT.THROTTLE_TIME) {
				time = now;
				return true;
			}
			return false;
		};
		this.throttle(now);
	},
	// 查找DOM节点
	searchUp: function searchUp(ele, type) {
		if (ele === document.body || ele === document) return undefined; // 向上递归到顶就停
		if (ele.classList.contains(type)) return ele;
		return this.searchUp(ele.parentNode, type);
	}
};

var dragdrop = {
	isResize: false, // 是否放大缩小
	dragNode: { // 拖拽节点的的关联数据
		id: undefined, // 拖拽节点的id
		node: null // 占位符节点的关联数据
	},
	dragElement: null, // 拖拽的dom节点
	dragStart: function dragStart(event, offsetX, offsetY, ele) {
		var classList = event.target.classList;
		// 取得网格对象
		var flowgrid = this.flowgrid = cache.get(node);
		// 配置项, 禁用拖拽
		if (!flowgrid.opt.draggable) return;
		// 判断是否放大缩小
		if (classList.contains(CONSTANT.FG_ITEM_ZOOM_BAR)) {
			this.isResize = true;
		}
		this.dragElement = node;
		// 取得当前拖拽节点, 并替换当前拖拽节点id
		var query = flowgrid.query(node.getAttribute(CONSTANT.FG_ITEM_DATA_ID));
		if (query) {
			this.dragElement.className = CONSTANT.FG_ITEM + ' ' + CONSTANT.FG_ITEM_GRAG_DROP;
			this.dragNode.id = query.node.id;
			this.dragNode.node = query.node;
			this.dragNode.node.id = CONSTANT.PLACEHOLDER;
			// 新增占位符
			var element = flowgrid.elements[this.dragNode.node.id] = view.create(flowgrid, this.dragNode.node);
			flowgrid.opt.container.appendChild(element);
		}
	},
	drag: function drag(event) {
		if (!this.dragNode.node) return;
		var flowgrid = this.flowgrid,
		    opt = flowgrid.opt,
		    container = opt.container,
		    containerOffset = view.getOffset(container),
		    // 取得容器偏移
		// 相对父元素的偏移坐标x,y
		translate = this.dragElement.style.transform,
		    value = translate.replace(/translate.*\(/ig, '').replace(/\).*$/ig, '').replace(/px/ig, '').split(','),
		    info = {
			containerX: containerOffset.left,
			containerY: containerOffset.top,
			containerW: container.clientWidth,
			translateX: value[0] * 1,
			translateY: value[1] * 1
		};
		// 赋初值
		this.prevX || (this.prevX = event.pageX);
		this.prevY || (this.prevY = event.pageY);
		// 计算位移
		info.dx = event.pageX - this.prevX;
		info.dy = event.pageY - this.prevY;
		// 保存当前坐标变成上一次的坐标
		this.prevX = event.pageX;
		this.prevY = event.pageY;
		// 转换坐标
		info.eventX = event.pageX - info.containerX;
		info.eventY = event.pageY - info.containerY;
		// 判断是不是放大缩小
		if (this.isResize) {
			this.resize(event, opt, info, flowgrid);
		} else {
			// 计算偏移
			this.eventOffsetX || (this.eventOffsetX = info.eventX - info.translateX);
			this.eventOffsetY || (this.eventOffsetY = info.eventY - info.translateY);
			this.changeLocation(event, opt, info, flowgrid);
		}
	},
	changeLocation: function changeLocation(event, opt, info, flowgrid) {
		var node = this.dragNode.node,
		    x = info.eventX - this.eventOffsetX,
		    y = info.eventY - this.eventOffsetY;
		// 计算坐标
		this.dragElement.style.cssText += ';transform: translate(' + x + 'px,' + y + 'px);';
		// 当前拖拽节点的坐标, 转换成对齐网格的坐标
		var nodeX = Math.round(x / opt.cellW_Int);
		var nodeY = Math.round(y / opt.cellH_Int);
		// 判断坐标是否变化
		if (node.x !== nodeX || node.y !== nodeY) {
			flowgrid.replaceNodeInArea(flowgrid.area, node);
			node.x = nodeX;
			node.y = nodeY;
			flowgrid.checkIndexIsOutOf(flowgrid.area, node, this.isResize);
			flowgrid.overlap(flowgrid.data, node, info.dx, info.dy, this.isResize);
			flowgrid.load();
		}
	},
	resize: function resize(event, opt, info, flowgrid) {
		var node = this.dragNode.node,
		    minW = node.minW * opt.cellW_Int - opt.padding.left - opt.padding.right,
		    minH = node.minH * opt.cellH_Int - opt.padding.top - opt.padding.bottom,
		    eventW = info.eventX - info.translateX + opt.overflow,
		    eventH = info.eventY - info.translateY + opt.overflow,
		    w = eventW,
		    h = eventH;
		// 判断最小宽
		if (eventW < minW) w = minW - opt.overflow;
		// 判断最小高
		if (eventH < minH) h = minH - opt.overflow;
		// 判断最大宽
		if (eventW + info.translateX > info.containerW) w = info.containerW - info.translateX + opt.overflow;
		// 设置宽高
		this.dragElement.style.cssText += ';width: ' + w + 'px; height: ' + h + 'px;';
		// 判断宽高是否变化
		var nodeW = Math.ceil(w / opt.cellW_Int),
		    nodeH = Math.ceil(h / opt.cellH_Int);
		if (node.w !== nodeW || node.h !== nodeH) {
			flowgrid.replaceNodeInArea(flowgrid.area, node);
			node.w = nodeW;
			node.h = nodeH;
			flowgrid.checkIndexIsOutOf(flowgrid.area, node, this.isResize);
			flowgrid.overlap(flowgrid.data, node, info.dx, info.dy, this.isResize);
			flowgrid.load();
		}
	},
	dragEnd: function dragEnd(event) {
		if (!this.dragNode.node) return;
		var flowgrid = this.flowgrid,
		    node = this.dragNode.node;
		node.id = this.dragNode.id;
		// 替换占位符
		view.update(flowgrid, flowgrid.elements[node.id], node);
		// 清理临时样式(结束拖拽)
		this.dragElement.className = CONSTANT.FG_ITEM + ' ' + CONSTANT.FG_ITEM_ANIMATE;
		// 清理临时变量
		this.flowgrid = null;
		this.isResize = false;
		this.dragNode.id = undefined;
		this.dragNode.node = null;
		// 清理临时坐标
		this.prevX = undefined;
		this.prevY = undefined;
		this.eventOffsetX = undefined;
		this.eventOffsetY = undefined;
		// 移除临时dom(占位符)
		view.remove(CONSTANT.PLACEHOLDER);
		delete flowgrid.elements[CONSTANT.PLACEHOLDER];
	}
};

var handleEvent = {
	init: function init(isbind) {
		if (this.isbind) return;
		this.isbind = isbind;
		this.unbindEvent();
		this.bindEvent();
	},
	destroy: function destroy() {
		this.unbindEvent();
	},
	bindEvent: function bindEvent() {
		document.addEventListener('mousedown', this.mouseDown, false);
		document.addEventListener('mousemove', this.mouseMove, false);
		document.addEventListener('mouseup', this.mouseUp, false);
		document.addEventListener('click', this.click, true);
		this.isbind = true;
	},
	unbindEvent: function unbindEvent() {
		document.removeEventListener('mousedown', this.mouseDown, false);
		document.removeEventListener('mousemove', this.mouseMove, false);
		document.removeEventListener('mouseup', this.mouseUp, false);
		document.removeEventListener('click', this.click, true);
		this.isbind = false;
	},
	mouseDown: function mouseDown(event) {
		var self = handleEvent;
		// 设置拖拽过程中禁用文本选中
		document.body.classList.add(CONSTANT.USER_SELECT_NONE);
		// 是否点击了拖拽节点
		var ele = self.ele = utils.searchUp(event.target, CONSTANT.FG_ITEM);
		if (ele) {
			// 记录位置, 通过比较拖拽距离来判断是否是拖拽, 如果是拖拽则阻止冒泡. 不触发点击事件
			self.dragStart = true;
			self.distance = globalConfig.distance;
			self.distanceX = event.pageX;
			self.distanceY = event.pageY;
			self.offsetX = event.offsetX || 0;
			self.offsetY = event.offsetY || 0;
		}
	},
	mouseMove: function mouseMove(event) {
		var self = handleEvent;
		if (!self.ele) return;
		if (self.dragStart && self.isDrag(event)) {
			self.dragStart = false;
			dragdrop.dragStart(event, self.offsetX, self.offsetY, self.ele);
			return;
		}
		utils.throttle(new Date().getTime()) && dragdrop.drag(event);
	},
	mouseUp: function mouseUp(event) {
		document.body.classList.remove(CONSTANT.USER_SELECT_NONE);
		dragdrop.dragEnd(event);
		// 清理临时变量
		var self = handleEvent;
		delete self.distance;
		delete self.distanceX;
		delete self.distanceY;
		delete self.offsetX;
		delete self.offsetY;
	},
	click: function click(event) {
		var self = handleEvent;
		if (self.dragStart === false) {
			// event.preventDefault();
			event.stopPropagation();
			delete self.dragStart;
		}
	},
	isDrag: function isDrag(event) {
		var self = handleEvent,
		    distanceX = Math.abs(event.pageX - self.distanceX || 0),
		    distanceY = Math.abs(event.pageY - self.distanceY || 0);
		if (self.distance < distanceX || self.distance < distanceY) {
			return true;
		}
	}
};

var fgContainer = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-container", class: { 'fg-no-draggable': !_vm.opt.draggable, 'fg-no-resizable': !_vm.opt.resizable }, attrs: { "fg-index": _vm.index } }, [_c('div', { staticClass: "fg-layout" }, [_vm._t("default"), _vm._v(" "), _c('div', { staticClass: "fg-item-dragdrop" })], 2)]);
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
      area: [],
      index: 1
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
      // 初始化监听
      handleEvent.init(true);
      // 缓存对象
      cache$1.init();
      this.index = cache$1.set(this);
      // 初始矩阵区域并布局
      this.buildArea();
      this.layout();
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
    // 碰撞检测, 从左到右, 从上到下
    collision: function collision(area, node) {
      for (var r = node.y; r < node.y + node.h; r++) {
        for (var c = node.x; c < node.x + node.w; c++) {
          if (area[r] && (area[r][c] || area[r][c] == 0)) return true;
        }
      }
    },
    // 流布局
    layout: function layout() {
      // 原理: 遍历数据集, 寻找节点上面是否有空行, 修改node.y, 进行上移.
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;

          var y = this.findEmptyLine(node);
          node.y > y && this.moveUp(node, y);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    },
    // 寻找空行, 扫描找到最接近顶部的空行是第几行
    findEmptyLine: function findEmptyLine(node) {
      var r = void 0,
          c = void 0,
          cell = void 0,
          area = this.area;
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
    moveUp: function moveUp(node, newRow, newId) {
      node.y = newRow;
      newId && (node.id = newId);
      for (var r = node.y; r < node.y + node.h; r++) {
        for (var c = node.x; c < node.x + node.w; c++) {
          this.area[r][c] = node.id;
        }
      }
    }
  },
  created: function created() {
    // 早于fg-item的钩子mounted执行
    this.init();
  },
  beforeUpdate: function beforeUpdate() {
    // 数据更新时重置区域, 并布局
    this.buildArea();
    this.layout();
    //console.log(this);
  },
  updated: function updated() {
    //console.log(this);
  },
  mounted: function mounted() {
    //console.log('mounted');
  },
  destroyed: function destroyed() {
    handleEvent.destroy();
  }
};

var fgItem = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-item", style: _vm.itemStyle, attrs: { "fg-id": _vm.node.id } }, [_c('div', { staticClass: "fg-item-content" }, [_vm._t("default")], 2), _vm._v(" "), _c('div', { staticClass: "fg-item-zoom-bar", attrs: { "fg-id": _vm.node.id } })]);
  },
  staticRenderFns: [],
  name: 'fg-item',
  props: ['node', // {id:'2', x: 0, y: 0, w: 4, h: 4}
  'index'],
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
    //       console.log('2222');
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
