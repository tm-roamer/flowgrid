import {CONSTANT, globalConfig} from './config';
import cache from './cache';
import utils from './utils';
import handleEvent from './event';
import view from './view';
import Flowgrid from './api';

// 拖拽对象
let dragdrop = {
	isDrag: false,              // 是否正在拖拽
	isResize: false,            // 是否放大缩小
	dragNode: {                 // 拖拽节点的的关联数据
		id: undefined,          // 拖拽节点的id
		node: null,             // 占位符节点的关联数据
	},
	dragElement: null,          // 拖拽的dom节点
	dragstart: function (event, node) {
		var classList = event.target.classList;
		// 取得网格对象
		var flowgrid = this.flowgrid = cache.get(node);
		// 配置项, 禁用拖拽
		if (!flowgrid.opt.draggable) return;
		// 判断拖拽句柄的情况
		if (!classList.contains(CONSTANT.FG_ITEM_DRAG_BAR)) {
			// 判断是否放大缩小
			if (classList.contains(CONSTANT.FG_ITEM_ZOOM_BAR)) {
				this.isResize = true;
			} else {
				// 如果有拖拽句柄的设置, 但没有选中, 则return
				if (flowgrid.opt.isDragBar) return;
			}
		}
		this.isDrag = true;
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
	drag: function (event) {
		if (!this.dragNode.node) return;
		var flowgrid = this.flowgrid,
			opt = flowgrid.opt,
			container = opt.container,
			containerOffset = view.getOffset(container),    // 取得容器偏移
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
	changeLocation: function (event, opt, info, flowgrid) {
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
	resize: function (event, opt, info, flowgrid) {
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
	dragend: function (event) {
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
		this.isDrag = false;
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

export default dragdrop;
