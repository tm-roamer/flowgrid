import cache from './cache'
import utils from './utils'

// 拖拽对象
let dragdrop = {
	isResize: false,            // 是否放大缩小
	dragNode: null,             // 拖拽节点的的关联的fg-item的vue对象
	dragElement: null,					// 拖拽节点dom对象
	dragStart: function (event, offsetX, offsetY, ele, isResize) {
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
			// 执行回调
			flowgrid.resizeStart(item);
		} else {
			var targetOffset = event.target.getBoundingClientRect();
			var eleOffset = ele.getBoundingClientRect();
			this.offsetX = targetOffset.left - eleOffset.left + offsetX || 0;
			this.offsetY = targetOffset.top - eleOffset.top + offsetY || 0;
			// 执行回调
			flowgrid.dragStart(item);
		}
	},
	drag: function (event) {
		if (!this.dragNode) return;
		// 赋初值
		this.prevX || (this.prevX = event.clientX);
		this.prevY || (this.prevY = event.clientY);
		// 计算位移
		this.dx = event.clientX - this.prevX;
		this.dy = event.clientY - this.prevY;
		// 保存当前坐标变成上一次的坐标
		this.prevX = event.clientX;
		this.prevY = event.clientY;
		// 转换坐标
		this.pageX = event.clientX;
		this.pageY = event.clientY;
		// 判断是缩放还是拖拽
		this.isResize ? this.resize() : this.position()
	},
	position: function () {
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
			// 执行回调
			flowgrid.drag(this.dragNode);
		}
	},
	resize: function () {
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
			// 执行回调
			flowgrid.resize(this.dragNode);
		}
	},
	dragEnd: function (event) {
		if (!this.dragNode) return;
		// 执行回调
		if (this.isResize) {
			this.flowgrid.resizeEnd(this.dragNode)
		} else {
			this.flowgrid.dragEnd(this.dragNode)
		}
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
}

export default dragdrop;
