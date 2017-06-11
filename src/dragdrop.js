import cache from './cache'
import utils from './utils'

// 拖拽对象
let dragdrop = {
	isResize: false,            // 是否放大缩小
	dragNode: null,             // 拖拽节点的的关联数据
	dragElement: null,					// 拖拽节点dom
	dragStart: function (event, offsetX, offsetY, ele) {
		// 判断是否点击了放大缩小
		if (event.target.classList.contains('fg-item-zoom-bar')) {
			this.isResize = true;
		}
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
		dragElement.appendChild(ele.querySelector('.fg-item-content').cloneNode(true));
		// 计算偏移量, 点击节点时: 点击位置与节点的左上角定点的偏移距离
		var targetOffset = event.target.getBoundingClientRect();
		var eleOffset = ele.getBoundingClientRect();
		var containerOffset = container.getBoundingClientRect();
		this.offsetX = targetOffset.left - eleOffset.left + offsetX || 0;
		this.offsetY = targetOffset.top - eleOffset.top + offsetY || 0;
		this.containerX = containerOffset.left;
		this.containerY = containerOffset.top;
	},
	drag: function (event) {
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
		// 判断是不是放大缩小
		if (this.isResize) {
			this.resize(this.flowgrid);
		} else {
			this.position(this.flowgrid);
		}
	},
	position: function (flowgrid) {
		var	x = this.pageX - this.containerX - this.offsetX;
		var y = this.pageY - this.containerY - this.offsetY;
		// 计算拖拽节点的坐标
		this.dragElement.style.cssText += ';transform: translate(' + x + 'px,' + y + 'px);';
		// 极值判断
		flowgrid.checkIndexIsOutOf(node, this.isResize);
		// debugger;
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
	resize: function (flowgrid) {
		var node = this.dragNode.node,
			minW = node.minW * opt.cellW_Int - opt.padding.left - opt.padding.right,
			minH = node.minH * opt.cellH_Int - opt.padding.top - opt.padding.bottom,
			eventW = info.eventX - info.translateX + opt.overflow,
			eventH = info.eventY - info.translateY + opt.overflow,
			w = eventW,
			h = eventH;
		// 判断最小宽
		if (eventW < minW)
			w = minW - opt.overflow;
		// 判断最小高
		if (eventH < minH)
			h = minH - opt.overflow;
		// 判断最大宽
		if (eventW + info.translateX > info.containerW)
			w = info.containerW - info.translateX + opt.overflow;
		// 计算拖拽节点的宽高
		this.dragElement.style.cssText += ';width: ' + w + 'px; height: ' + h + 'px;';
		// 判断宽高是否变化
		var nodeW = Math.ceil(w / opt.cellW_Int);
		var nodeH = Math.ceil(h / opt.cellH_Int);
		if (node.w !== nodeW || node.h !== nodeH) {
			node.w = nodeW;
			node.h = nodeH;
			flowgrid.checkIndexIsOutOf(node, this.isResize);
			flowgrid.overlap(node, this.dx, this.dy, this.isResize);
		}
	},
	dragEnd: function (event) {
		if (!this.dragNode) return;
		// 清空拖拽节点样式和内容
		this.dragElement.removeAttribute('style');
		this.dragElement.innerHTML = '';
		// 隐藏拖拽节点
		this.flowgrid.isDrag = false;
		// 取消占位符样式
		this.dragNode.placeholder = false;
		// 临时变量
		delete this.container;
		delete this.flowgrid;
		delete this.dragNode;
		delete this.dragElement;
		this.isResize = false;
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
}

export default dragdrop;
