(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.flowgrid = factory());
}(this, (function () { 'use strict';

var version = "1.2.1";

// 常量
var CONSTANT = {
	THROTTLE_TIME: 15 // 节流函数的间隔时间单位ms, FPS = 1000 / THROTTLE_TIME


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
var cache = {
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

// 拖拽对象
var dragdrop = {
	isResize: false, // 是否放大缩小
	dragNode: null, // 拖拽节点的的关联的fg-item的vue对象
	dragElement: null, // 拖拽节点dom对象
	dragStart: function dragStart(event, offsetX, offsetY, ele, isResize) {
		// 取得vue网格对象 flowgrid === fg-container.vue
		var container = this.container = utils.searchUp(ele, 'fg-layout');
		var flowgrid = this.flowgrid = cache.get(container.getAttribute('index'));
		// 配置项, 禁用拖拽
		if (!flowgrid.opt.draggable) return;
		// 取得当前vue被拖拽节点
		var item = flowgrid.$children[ele.getAttribute('index') * 1];
		// 留存备份一份 this.dragNode === fg-item.vue
		this.dragNode = item;
		// 将当前vue节点变成占位符, 控制样式
		item.placeholder = true;
		// 显示拖拽节点
		flowgrid.isDrag = true;
		// 将当前dom节点的内容区复制一份到拖拽节点
		var dragElement = this.dragElement = container.querySelector('.fg-item-dragdrop');
		dragElement.setAttribute("style", ele.getAttribute("style"));
		dragElement.innerHTML = ele.innerHTML;

		// 计算偏移量, 点击节点时: 点击位置与节点的左上角定点的偏移距离
		var containerOffset = container.getBoundingClientRect();
		this.containerX = containerOffset.left;
		this.containerY = containerOffset.top;
		// 判断是否点击了放大缩小
		if (isResize) {
			this.isResize = isResize;
			this.offsetX = offsetX || 0;
			this.offsetY = offsetY || 0;
		} else {
			var targetOffset = event.target.getBoundingClientRect();
			var eleOffset = ele.getBoundingClientRect();
			this.offsetX = targetOffset.left - eleOffset.left + offsetX || 0;
			this.offsetY = targetOffset.top - eleOffset.top + offsetY || 0;
		}
		console.log(event.target);
	},
	drag: function drag(event) {
		if (!this.dragNode) return;
		// 赋初值
		this.prevX || (this.prevX = event.pageX);
		this.prevY || (this.prevY = event.pageY);
		// 计算位移
		this.dx = event.pageX - this.prevX;
		this.dy = event.pageY - this.prevY;
		// 保存当前坐标变成上一次的坐标
		this.prevX = event.pageX;
		this.prevY = event.pageY;
		// 转换坐标
		this.pageX = event.pageX;
		this.pageY = event.pageY;
		// 判断是缩放还是拖拽
		this.isResize ? this.resize() : this.position();
	},
	position: function position() {
		var flowgrid = this.flowgrid;
		var x = this.pageX - this.containerX - this.offsetX;
		var y = this.pageY - this.containerY - this.offsetY;
		// 计算拖拽节点的坐标
		this.dragElement.style.cssText += ';transform: translate(' + x + 'px,' + y + 'px);';
		// 极值判断
		var maxW = flowgrid.opt.containerW;
		var eleW = parseInt(this.dragElement.style.width);
		x < 0 && (x = 0);
		y < 0 && (y = 0);
		x + eleW > maxW && (x = maxW - eleW);
		// 当前拖拽节点的坐标, 转换成对齐网格的坐标
		var node = this.dragNode.node;
		var nodeX = Math.round(x / flowgrid.opt.cellW_Int);
		var nodeY = Math.round(y / flowgrid.opt.cellH_Int);
		// 判断坐标是否变化
		if (node.x !== nodeX || node.y !== nodeY) {
			node.x = nodeX;
			node.y = nodeY;
			flowgrid.overlap(node, this.dx, this.dy, this.isResize);
		}
	},
	resize: function resize() {
		// debugger;
		var flowgrid = this.flowgrid,
		    opt = flowgrid.opt,
		    node = this.dragNode.node,
		    minW = node.minW * opt.cellW_Int - opt.padding.left - opt.padding.right - opt.overflow,
		    minH = node.minH * opt.cellH_Int - opt.padding.top - opt.padding.bottom - opt.overflow,
		    translate = this.dragElement.style.transform,
		    coord = translate.replace(/translate.*\(/ig, '').replace(/\).*$/ig, '').replace(/px/ig, '').split(','),
		    x = parseInt(coord[0]),
		    y = parseInt(coord[1]),
		    w = this.pageX - this.containerX - x + this.offsetX,
		    h = this.pageY - this.containerY - y + this.offsetY;
		// 极值判断
		var maxW = opt.containerW;
		w < minW && (w = minW);
		h < minH && (h = minH);
		w + x > maxW && (w = maxW - x + opt.overflow);
		// 计算拖拽节点的宽高
		this.dragElement.style.cssText += ';width: ' + w + 'px; height: ' + h + 'px;';
		// 判断宽高是否变化
		var nodeW = Math.ceil(w / opt.cellW_Int);
		var nodeH = Math.ceil(h / opt.cellH_Int);
		if (node.w !== nodeW || node.h !== nodeH) {
			node.w = nodeW;
			node.h = nodeH;
			flowgrid.overlap(node, this.dx, this.dy, this.isResize);
		}
	},
	dragEnd: function dragEnd(event) {
		if (!this.dragNode) return;
		// 清空拖拽节点样式和内容
		this.dragElement.removeAttribute('style');
		this.dragElement.innerHTML = '';
		// 隐藏拖拽节点
		this.flowgrid.isDrag = false;
		// 取消占位符样式
		this.dragNode.placeholder = false;
		// 重置状态
		this.isResize = false;
		// 临时变量
		delete this.container;
		delete this.flowgrid;
		delete this.dragNode;
		delete this.dragElement;
		// 删除偏移量
		delete this.dx;
		delete this.dy;
		delete this.prevX;
		delete this.prevY;
		delete this.pageX;
		delete this.pageY;
		delete this.offsetX;
		delete this.offsetY;
		delete this.containerX;
		delete this.containerY;
	}
};

// 事件处理对象
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
		document.body.classList.add('fg-user-select-none');
		// 是否点击了拖拽节点
		var ele = self.ele = utils.searchUp(event.target, 'fg-item');
		if (ele) {
			if (event.target.classList.contains('fg-item-zoom-bar')) {
				self.isResize = true;
			}
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
			dragdrop.dragStart(event, self.offsetX, self.offsetY, self.ele, self.isResize);
			return;
		}
		utils.throttle(new Date().getTime()) && dragdrop.drag(event);
	},
	mouseUp: function mouseUp(event) {
		document.body.classList.remove('fg-user-select-none');
		dragdrop.dragEnd(event);
		// 清理临时变量
		var self = handleEvent;
		delete self.distance;
		delete self.distanceX;
		delete self.distanceY;
		delete self.offsetX;
		delete self.offsetY;
		delete self.isResize;
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
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-container" }, [_c('div', { staticClass: "fg-layout", class: { 'fg-no-draggable': !_vm.opt.draggable, 'fg-no-resizable': !_vm.opt.resizable }, attrs: { "index": _vm.index } }, [_vm._t("default"), _vm._v(" "), _c('div', { directives: [{ name: "show", rawName: "v-show", value: _vm.isDrag, expression: "isDrag" }], staticClass: "fg-item-dragdrop" })], 2)]);
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
      index: 1,
      isDrag: false
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
      handleEvent.init(true);
      // 缓存对象
      cache.init();
      this.index = cache.set(this);
      this.load();
    },
    load: function load() {
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
    // 碰撞检测, 从左到右, 从上到下扫描
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
    },
    // 调整大小
    resize: function resize(containerW, containerH) {
      this.opt.containerW = containerW;
      this.computeCell(this.opt);
      this.load();
    },
    // 碰撞检测, 两个矩形是否发生碰撞
    checkHit: function checkHit(n, node) {
      var result = false;
      if (n.x + n.w > node.x && n.x < node.x + node.w) {
        if (n.y + n.h > node.y && n.y < node.y + node.h) {
          result = true;
        }
      }
      return result;
    },
    // 节点重叠, 拖拽节点过程中, 将所有节点坐标重新计算
    overlap: function overlap(node, dx, dy, isResize) {
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
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var n = _step4.value;

            if (n !== node && checkHit(n, node)) {
              var val = n.y + n.h - node.y;
              if (val > offsetUnderY) {
                offsetUnderY = val;
                offsetNode = n;
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        if (offsetNode) {
          // 判断插入点应该上移还是下移, 通过重叠点的中间值h/2来判断
          var median = offsetNode.h / 2 < 1 ? 1 : Math.floor(offsetNode.h / 2);
          // 计算差值, 与中间值比较, dy > 2 下移(2是优化, 防止平移上下震动), 拿y+h来和中间值比较
          var difference = dy >= 2 && dy >= dx ? node.y + node.h - offsetNode.y : node.y - offsetNode.y;
          // 大于中间值, 求出下面那部分截断的偏移量, 等于是怕上下顺序连续的块,会错过互换位置
          if (difference >= median) {
            node.y = node.y + offsetUnderY;
          }
        }
      }
      // 向上插入节点
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _n = _step5.value;

          if (_n !== node && checkHit(_n, node)) {
            var val = node.y - _n.y;
            offsetUpY = val > offsetUpY ? val : offsetUpY;
          }
        }
        // 重新计算y值
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var _n2 = _step6.value;

          if (_n2 !== node) {
            if (_n2.y < node.y && node.y < _n2.y + _n2.h || node.y <= _n2.y) {
              _n2.y = _n2.y + node.h + offsetUpY;
            }
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return this;
    }
  },
  created: function created() {
    // 早于fg-item的钩子mounted执行
    this.init();
  },
  beforeUpdate: function beforeUpdate() {
    // 数据即将更新时重置区域, 并应用布局
    this.load();
  },
  updated: function updated() {},
  mounted: function mounted() {},
  destroyed: function destroyed() {
    handleEvent.destroy();
  }
};

var fgItem = {
  render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "fg-item fg-item-animate", class: { 'fg-item-placeholder': _vm.placeholder }, style: _vm.itemStyle, attrs: { "fg-id": _vm.node.id, "index": _vm.index } }, [_c('div', { staticClass: "fg-item-content" }, [_vm._t("default")], 2), _vm._v(" "), _c('div', { staticClass: "fg-item-zoom-bar", attrs: { "fg-id": _vm.node.id, "index": _vm.index } })]);
  },
  staticRenderFns: [],
  name: 'fg-item',
  props: ['node', // {id:'2', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 2}
  'index' // node在nodes中的索引值
  ],
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
    return {
      placeholder: false
    };
  },
  mounted: function mounted() {}
};

var index = {
	version: version,
	fgContainer: fgContainer,
	fgItem: fgItem
};

return index;

})));
//# sourceMappingURL=flowgrid.js.map
