
// 网格对象原型
Flowgrid.prototype = {
	destroy: function () {
		this.opt = null;
		this.area = null;
		this.data = null;
		return this;
	},
	resize: function (containerW, containerH) {
		var opt = this.opt,
			container = opt.container;
		this.computeCellScale(opt);
		this.load();
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
	}
};
