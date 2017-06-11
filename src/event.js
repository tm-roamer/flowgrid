import {globalConfig} from './config'
import utils from './utils'
import dragdrop from './dragdrop'

// 事件处理对象
let handleEvent = {
	init: function (isbind) {
		if (this.isbind) return;
		this.isbind = isbind;
		this.unbindEvent();
		this.bindEvent();
	},
	destroy: function () {
		this.unbindEvent();
	},
	bindEvent: function () {
		document.addEventListener('mousedown', this.mouseDown, false);
		document.addEventListener('mousemove', this.mouseMove, false);
		document.addEventListener('mouseup', this.mouseUp, false);
		document.addEventListener('click', this.click, true);
		this.isbind = true;
	},
	unbindEvent: function () {
		document.removeEventListener('mousedown', this.mouseDown, false);
		document.removeEventListener('mousemove', this.mouseMove, false);
		document.removeEventListener('mouseup', this.mouseUp, false);
		document.removeEventListener('click', this.click, true);
		this.isbind = false;
	},
	mouseDown: function (event) {
		let self = handleEvent;
		// 设置拖拽过程中禁用文本选中
		document.body.classList.add('fg-user-select-none');
		// 是否点击了拖拽节点
		let ele = self.ele = utils.searchUp(event.target, 'fg-item');
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
	mouseMove: function (event) {
		let self = handleEvent;
		if (!self.ele) return;
		if (self.dragStart && self.isDrag(event)) {
			self.dragStart = false;
			dragdrop.dragStart(event, self.offsetX, self.offsetY, self.ele, self.isResize);
			return;
		}
		utils.throttle(new Date().getTime()) && dragdrop.drag(event);
	},
	mouseUp: function (event) {
		document.body.classList.remove('fg-user-select-none');
		dragdrop.dragEnd(event);
		// 清理临时变量
		let self = handleEvent;
		delete self.distance;
		delete self.distanceX;
		delete self.distanceY;
		delete self.offsetX;
		delete self.offsetY;
		delete self.isResize;
	},
	click: function (event) {
		let self = handleEvent;
		if (self.dragStart === false) {
			// event.preventDefault();
			event.stopPropagation();
			delete self.dragStart
		}
	},
	isDrag: function (event) {
		var self = handleEvent,
				distanceX = Math.abs(event.pageX - self.distanceX || 0),
				distanceY = Math.abs(event.pageY - self.distanceY || 0);
		if (self.distance < distanceX || self.distance < distanceY) {
			return true;
		}
	}
}

export default handleEvent;
