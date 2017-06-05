import {CONSTANT, globalConfig} from './config';
import cache from './cache';
import utils from './utils';
import handleEvent from './event';
import dragdrop from './dragdrop';
import Flowgrid from './api';

// 展示对象, 操作dom
var view = {
	// 转换初始化, 将初始dom转换成js对象
	dom2obj: function (container, flowgrid) {
		var i, len, ele, node, arr = [],
			elements = container.children;
		for (i = 0, len = elements.length; i < len; i++) {
			ele = elements[i];
			if (ele.classList.contains(CONSTANT.FG_ITEM)) {
				arr[i] = {
					x: ele.getAttribute('data-fg-x') * 1,
					y: ele.getAttribute('data-fg-y') * 1,
					w: ele.getAttribute('data-fg-w') * 1,
					h: ele.getAttribute('data-fg-h') * 1,
					minW: ele.getAttribute('data-fg-min-w') * 1,
					minH: ele.getAttribute('data-fg-min-h') * 1
				};
				var id = ele.getAttribute('data-fg-id');
				if (id) {
					arr[i].id = id;
					flowgrid.elements[id] = ele;
				} else {
					flowgrid.elements[i] = ele;
				}
			}
		}
		return arr;
	},
	setContainerAttr: function (container, opt, draggable, resizable) {
		if (container) {
			if (typeof draggable !== 'undefined') {
				opt.draggable = !!draggable;
				opt.container.setAttribute(CONSTANT.FG_LAYOUT_DRAGGABLE, opt.draggable);
			}
			if (typeof resizable !== 'undefined') {
				opt.resizable = !!resizable;
				opt.container.setAttribute(CONSTANT.FG_LAYOUT_RESIZABLE, opt.resizable);
			}
		}
	},
	getOffset: function(node, offset) {
		offset = offset ? offset : {top: 0, left: 0};
		if (node === null || node === document) return offset;
		offset.top += node.offsetTop;
		offset.left += node.offsetLeft;
		return this.getOffset(node.offsetParent, offset);
	},
	searchUp: function (node, type) {
		if (node === document.body || node === document) return undefined;   // 向上递归到顶就停
		if (node.classList.contains(type)) return node;
		return this.searchUp(node.parentNode, type);
	},
	create: function (flowgrid, node, className) {
		var item = document.createElement("div"),
			zoom = document.createElement("div"),
			content = document.createElement("div");
		// 是否配置了拖拽句柄
		if (flowgrid.opt.isDragBar) {
			var drag = document.createElement("div");
			drag.className = CONSTANT.FG_ITEM_DRAG_BAR;
			drag.innerHTML = '<svg class="' + CONSTANT.FG_ITEM_DRAG_BAR_ICO + '" viewBox="0 0 200 200"'
				+ 'version="1.1" xmlns="http://www.w3.org/2000/svg" '
				+ 'xmlns:xlink="http://www.w3.org/1999/xlink">'
				+ '<g class="transform-group">'
				+ '<g transform="scale(0.1953125, 0.1953125)">'
				+ '<path d="M 839.457 330.079 c 36.379 0 181.921 145.538 181.921 181.926 '
				+ 'c 0 36.379 -145.543 181.916 -181.921 181.916 '
				+ 'c -36.382 0 -36.382 -36.388 -36.382 -36.388 '
				+ 'v -291.07 c 0 0 0 -36.384 36.382 -36.384 '
				+ 'v 0 Z M 803.058 475.617 v 72.766 l -254.687 -0.001 '
				+ 'v 254.692 h -72.766 v -254.691 h -254.683 '
				+ 'v -72.766 h 254.682 v -254.693 h 72.766 v 254.692 '
				+ 'l 254.688 0.001 Z M 693.921 184.546 c 0 36.377 -36.388 36.377 -36.388 36.377 '
				+ 'h -291.07 c 0 0 -36.383 0 -36.383 -36.377 c 0 -36.387 145.538 -181.926 181.926 -181.926 '
				+ 'c 36.375 0 181.915 145.539 181.915 181.926 v 0 Z M 657.531 803.075 '
				+ 'c 0 0 36.388 0 36.388 36.382 c 0 36.388 -145.538 181.921 -181.916 181.921 '
				+ 'c -36.387 0 -181.926 -145.532 -181.926 -181.921 c 0 -36.382 36.383 -36.382 36.383 -36.382 '
				+ 'h 291.07 Z M 220.924 548.383 v 109.149 c 0 0 0 36.388 -36.377 36.388 '
				+ 'c -36.387 0 -181.926 -145.538 -181.926 -181.916 c 0 -36.387 145.538 -181.926 181.926 -181.926 '
				+ 'c 36.377 0 36.377 36.383 36.377 36.383 v 181.92 Z M 220.924 548.383 Z"></path></g></g></svg>';
			item.appendChild(drag);
		}
		item.className = className ? className : (CONSTANT.FG_ITEM + ' ' + CONSTANT.FG_ITEM_ANIMATE);
		zoom.className = CONSTANT.FG_ITEM_ZOOM_BAR;
		content.className = CONSTANT.FG_ITEM_CONTENT;
		item.appendChild(content);
		item.appendChild(zoom);
		this.update(flowgrid, item, node, className);
		return item;
	},
	update: function (flowgrid, element, node, className) {
		var opt = flowgrid.opt;
		// ??? 优化, 先计算好所有的统一加入改变如何 ??? 使用文档碎片。(document fragment)
		// 1 先隐藏元素，修改完再显示。
		// 2 使用文档碎片。(document fragment)
		// 3 先创建一个文档元素的备份，修改备份，再添加会文档中
		if (element) {
			element.className = className ? className : (CONSTANT.FG_ITEM + ' ' + CONSTANT.FG_ITEM_ANIMATE);
			element.setAttribute(CONSTANT.FG_ITEM_DATA_ID, node.id);
			element.setAttribute('data-fg-x', node.x);
			element.setAttribute('data-fg-y', node.y);
			element.setAttribute('data-fg-w', node.w);
			element.setAttribute('data-fg-h', node.h);
			element.style.cssText += (';transform: translate(' + (node.x * opt.cellW_Int) + 'px,'
			+ (node.y * opt.cellH_Int) + 'px);'
			+ 'width: ' + (node.w * opt.cellW_Int - opt.padding.left - opt.padding.right) + 'px;'
			+ 'height: ' + (node.h * opt.cellH_Int - opt.padding.top - opt.padding.bottom) + 'px;');
		}
	},
	clear: function (container) {
		container.innerHTML = '';
	},
	remove: function (id) {
		var delElement = document.querySelector('div.' + CONSTANT.FG_ITEM + '[' + CONSTANT.FG_ITEM_DATA_ID + '="' + id + '"]');
		delElement && delElement.parentNode.removeChild(delElement);
	},
	render: function (data, elements, container, flowgrid) {
		var i, len, node, element;
		if (utils.isEmptyObject(elements)) {
			var fragment = document.createDocumentFragment();
			for (i = 0, len = data.length; i < len; i++) {
				node = data[i];
				if (node) {
					element = elements[node.id] = this.create(flowgrid, node)
					fragment.appendChild(element);
				}
			}
			container.appendChild(fragment);
		} else {
			for (i = 0, len = data.length; i < len; i++) {
				node = data[i];
				if (node) {
					if (elements[node.id]) {
						this.update(flowgrid, elements[node.id], node)
					} else {
						element = elements[node.id] = this.create(flowgrid, node)
						container.appendChild(element);
					}
				}
			}
		}
	}
};

export default view;
