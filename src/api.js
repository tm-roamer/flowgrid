
import {CONSTANT, globalConfig} from './config';
import cache from './cache';
import utils from './utils';
import handleEvent from './event';
import dragdrop from './dragdrop';
import view from './view';

// 网格对象
function Flowgrid(options, container, originalData) {
	// 兼容多种配置情况
	if (Array.isArray(options) && originalData === undefined) {
		originalData = options;
		options = undefined;
	}
	this.init(options, container, originalData);
}

// 网格对象原型
Flowgrid.prototype = {
	constructor: Flowgrid,
	init: function (options, container, originalData) {
		var opt = utils.extend(globalConfig, options);
		this.originalData = [];
		this.area = [];
		this.data = [];
		this.elements = {};
		this.opt = opt;
		this.opt.container = container;
		this.computeCellScale(opt);
		if (originalData) {
			this.setData(originalData)
		} else {
			var arr = view.dom2obj(container, this);
			if (arr && arr.length > 0) {
				this.setData(arr);
			}
		}
		return this;
	},
	destroy: function () {
		this.originalData = null;
		this.opt = null;
		this.area = null;
		this.data = null;
		this.elements = null;
		return this;
	},
	clean: function() {
		this.originalData = [];
		this.area = [];
		this.data = [];
		this.elements = {};
		return this;
	},
	loadDom: function (isload) {
		if (isload === undefined || isload === true) {
			this.originalData = [];
			this.area = [];
			this.data = [];
			this.elements = {};
			var arr = view.dom2obj(this.opt.container, this);
			if (arr && arr.length > 0) {
				this.setData(arr);
			}
		}
		return this;
	},
	load: function (isload) {
		if (isload === undefined || isload === true) {
			var self = this,
				opt = this.opt,
				area = this.area,
				data = this.data,
				elements = this.elements,
				maxRowAndCol = this.getMaxRowAndCol(opt, data);
			view.setContainerAttr(opt.container, opt, opt.draggable, opt.draggable);
			// 重绘
			this.sortData(data)
				.buildArea(area, maxRowAndCol.row, maxRowAndCol.col)
				.putData(area, data)
				.layout(area, data);
			view.render(data, elements, opt.container, this);
			utils.callbackFun(function () {
				self.opt.onLoad && self.opt.onLoad();
			});
		}
		return this;
	},
	resize: function (containerW, containerH) {
		var opt = this.opt,
			container = opt.container;
		this.computeCellScale(opt);
		this.load();
	},
	// 计算最小网格宽高
	computeCellScale: function (opt) {
		opt.containerW = opt.container.clientWidth;
		opt.containerH = opt.container.clientHeight;
		opt.cellW = opt.containerW / opt.col;
		opt.cellH = opt.cellW / opt.cellScale.w * opt.cellScale.h;
		opt.cellW_Int = Math.floor(opt.cellW);
		opt.cellH_Int = Math.floor(opt.cellH);
		return this;
	},
	// 设置数据
	setData: function (originalData, isload) {
		// 遍历原始数据
		if (originalData && Array.isArray(originalData)) {
			this.originalData = originalData;
			var opt = this.opt,
				data = this.data = [];
			// 制作渲染数据
			originalData.forEach(function (node, idx) {
				data[idx] = utils.buildNode(node, idx, opt);
			});
			// 再刷新
			this.load(isload);
		}
		return this;
	},
	sortData: function (data) {
		data.sort(function (a, b) {
			var y = a.y - b.y
			return y === 0 ? a.x - b.x : y;
		});
		return this;
	},
	// 构建网格区域
	buildArea: function (area, row, col) {
		if (area && Array.isArray(area)) {
			for (var r = 0; r < row; r++) {
				area[r] = new Array(col);
			}
		}
		return this;
	},
	// 将数据铺进网格布局
	putData: function (area, data) {
		var i, r, c, len, rlen, clen, node;
		for (i = 0, len = data.length; i < len; i++) {
			node = data[i];
			for (r = node.y, rlen = node.y + node.h; r < rlen; r++) {
				for (c = node.x, clen = node.x + node.w; c < clen; c++) {
					area[r][c] = node.id;
				}
			}
		}
		return this;
	},
	// 取得区域中的最大行和列
	getMaxRowAndCol: function (opt, data) {
		var opt = opt || this.opt,
			data = data || this.data,
			i, n, len, max = {row: opt.row, col: opt.col};
		if (data && data.length > 0) {
			for (i = 0, len = data.length; i < len; i++) {
				n = data[i];
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
	add: function (n, isload) {
		var node,
			self = this,
			opt = this.opt,
			area = this.area,
			data = this.data;
		if (n) {
			node = utils.buildNode(n, (n.id || data.length), opt);
			this.checkIndexIsOutOf(area, node);
			this.overlap(data, node);
		} else {
			var node = utils.buildNode(opt.autoAddCell, data.length, opt);
			node = this.addAutoNode(area, node);
		}
		data[data.length] = node;
		this.load(isload);
		utils.callbackFun(function () {
			self.opt.onAddNode && self.opt.onAddNode(self.elements[node.id], node);
		})
		return node;
	},
	// 取得节点空位
	getVacant: function (w, h) {
		return this.addAutoNode(this.area, this.data, {x: 0, y: 0, w: w, h: h});
	},
	// 自动扫描空位添加节点
	addAutoNode: function (area, data, node) {
		if (data.length === 0) return node;
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
	delete: function (id, isload) {
		var self = this,
			data = this.data,
			area = this.area,
			queryNode = this.query(id),
			index = queryNode.index,
			node = queryNode.node;
		var arr = data.splice(index, 1);
		view.remove(id);
		delete this.elements[id];
		this.replaceNodeInArea(area, node).load(isload);
		utils.callbackFun(function () {
			self.opt.onDeleteNode && self.opt.onDeleteNode(self.elements[id], arr[0]);
		});
		return arr[0];
	},
	edit: function (n, isload) {
		var node = this.query(n.id).node;
		for (var k in n) {
			node[k] = n[k];
		}
		this.load(isload);
		return node;
	},
	query: function (id) {
		var data = this.data;
		for (var i = 0, len = data.length; i < len; i++) {
			if (data[i].id == id) {
				return {
					index: i,
					node: data[i]
				};
			}
		}
	},
	setDraggable: function (draggable) {
		var opt = this.opt;
		view.setContainerAttr(opt.container, opt, draggable, undefined);
		return this;
	},
	setResizable: function (resizable) {
		var opt = this.opt;
		view.setContainerAttr(opt.container, opt, undefined, resizable);
		return this;
	},
	// 检测脏数据
	checkIndexIsOutOf: function (area, node, isResize) {
		var row = area.length,
			col = (area[0] && area[0].length) || this.opt.col;
		// 数组下标越界检查
		node.x < 0 && (node.x = 0);
		node.y < 0 && (node.y = 0);
		if (isResize) {
			node.x + node.w > col && (node.w = col - node.x);
		} else {
			node.x + node.w > col && (node.x = col - node.w);
		}
		return this;
	},
	// 检测矩形碰撞
	checkHit: function (n, node) {
		var result = false;
		if ((n.x + n.w > node.x) && (n.x < node.x + node.w)) {
			if ((n.y + n.h > node.y) && (n.y < node.y + node.h)) {
				result = true;
			}
		}
		return result;
	},
	// 节点重叠
	overlap: function (data, node, dx, dy, isResize) {
		var i, n, len,
			dx = dx || 0,
			dy = dy || 0,
			offsetNode = null,
			offsetUnderY = 0,
			offsetUpY = 0,
			isResize = isResize || false,
			checkHit = this.checkHit;
		// 向下, 向左, 向右插入节点
		if (!isResize) {
			for (i = 0, len = data.length; i < len; i++) {
				n = data[i];
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
		for (i = 0, len = data.length; i < len; i++) {
			n = data[i];
			if (n !== node && checkHit(n, node)) {
				var val = node.y - n.y;
				offsetUpY = val > offsetUpY ? val : offsetUpY;
			}
		}
		// 重新计算y值
		for (i = 0, len = data.length; i < len; i++) {
			n = data[i];
			if (n !== node) {
				if ((n.y < node.y && node.y < n.y + n.h) || node.y <= n.y) {
					n.y = n.y + node.h + offsetUpY;
				}
			}
		}
		return this;
	},
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
	clone: function (node) {
		var obj = {};
		for (var attr in node)
			if (node.hasOwnProperty(attr))
				obj[attr] = node[attr];
		return obj;
	}
};

export default Flowgrid;
