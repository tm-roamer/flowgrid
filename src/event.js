import utils from './utils'
import dragdrop from './dragdrop'

//配置选项
let configOption;
// 事件处理对象
let handleEvent = {
	init: function (isbind, opt) {
		if (this.isbind) return;
		configOption = opt;
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
		//判断按下的是否是鼠标左键(或者是否是设置的键)
		if(!self.ifLeft(event))	return;
		// 是否点击了拖拽节点
		let ele = self.ele = utils.searchUp(event.target, 'fg-item');
		if (ele) {
			// 设置拖拽过程中禁用文本选中
			document.body.classList.add('fg-user-select-none');
			// 判断是否是缩放
			if (event.target.classList.contains('fg-item-zoom-bar')) {
				self.isResize = true;
			}
			// 记录位置, 通过比较拖拽距离来判断是否是拖拽, 如果是拖拽则阻止冒泡. 不触发点击事件
			self.dragStart = true;
			self.distance = configOption.distance;
			self.distanceX = event.clientX;
			self.distanceY = event.clientY;
			self.offsetX = event.offsetX || 0;
			self.offsetY = event.offsetY || 0;
		}
	},
	mouseMove: function (event) {
		let self = handleEvent;
		if(!self.ifLeft(event))	return;
		if (!self.ele) return;
		if (self.dragStart && self.isDrag(event)) {
			self.dragStart = false;
			dragdrop.dragStart(event, self.offsetX, self.offsetY, self.ele, self.isResize);
			return;
		}
		utils.throttle(new Date().getTime()) && dragdrop.drag(event);
	},
	mouseUp: function (event) {
		// 清理临时变量
		let self = handleEvent;

		if(!self.ifLeft(event))	return;
		document.body.classList.remove('fg-user-select-none');
		dragdrop.dragEnd(event);

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
			event.stopPropagation();
			delete self.dragStart
		}
	},
	isDrag: function (event) {
		var self = handleEvent,
				distanceX = Math.abs(event.clientX - self.distanceX || 0),
				distanceY = Math.abs(event.clientY - self.distanceY || 0);
		if (self.distance < distanceX || self.distance < distanceY) {
			return true;
		}
	},
	//判断是否是按下了左键, 0为左键
	ifLeft: function (event) {
		return event.button === 0;
	}
}

export default handleEvent;
