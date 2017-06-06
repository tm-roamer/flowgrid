import {CONSTANT, globalConfig} from './config';
import utils from './utils';

// 展示对象, 操作dom
var view = {
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
