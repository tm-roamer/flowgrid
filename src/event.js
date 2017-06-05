import {CONSTANT, globalConfig} from './config';
import cache from './cache';
import utils from './utils';
import dragdrop from './dragdrop';
import view from './view';
import Flowgrid from './api';

// 事件处理对象
let handleEvent = {
	init: function (isbind) {
		if (this.isbind) return;
		this.isbind = isbind;
		this.unbindEvent();
		this.bindEvent();
	},
	// 绑定监听
	bindEvent: function () {
		document.addEventListener('mousedown', this.mousedown, false);
		document.addEventListener('mousemove', this.mousemove, false);
		document.addEventListener('mouseup', this.mouseup, false);
		document.addEventListener('click', this.click, true);
		this.isbind = true;
	},
	// 移除监听
	unbindEvent: function () {
		document.removeEventListener('mousedown', this.mousedown, false);
		document.removeEventListener('mousemove', this.mousemove, false);
		document.removeEventListener('mouseup', this.mouseup, false);
		document.removeEventListener('click', this.click, true);
		this.isbind = false;
	},
	mousedown: function (event) {
		var node = this.node = view.searchUp(event.target, CONSTANT.FG_ITEM)
		if (node) {
			dragdrop.dragstart(event, node);
			var isResize = dragdrop.isResize;
			var flowgrid = dragdrop.flowgrid;
			this.distance = flowgrid.opt.distance;
			this.pageX = event.pageX;
			this.pageY = event.pageY;
			if (flowgrid.opt.draggable) {
				utils.callbackFun(function () {
					isResize ? flowgrid.opt.onResizeStart(event, dragdrop.dragElement, dragdrop.dragNode)
						: flowgrid.opt.onDragStart(event, dragdrop.dragElement, dragdrop.dragNode);
				})
			}
		}
	},
	mousemove: function (event) {
		if (dragdrop.isDrag) {
			var x = Math.abs(event.pageX - this.pageX);
			var y = Math.abs(event.pageY - this.pageY);
			this.triggerDistance = this.distance ? (x >= this.distance || y >= this.distance) : false;
			if (this.triggerDistance || dragdrop.isResize) {
				utils.throttle(new Date().getTime()) && dragdrop.drag(event);
			}
		}
	},
	mouseup: function (event) {
		if (dragdrop.isDrag) {
			var triggerDistance = this.triggerDistance;
			var isResize = dragdrop.isResize;
			var flowgrid = dragdrop.flowgrid;
			var node = flowgrid.clone(dragdrop.dragNode);
			utils.callbackFun(function () {
				if (triggerDistance) {
					isResize ? flowgrid.opt.onResizeEnd(event, dragdrop.dragElement, node)
						: flowgrid.opt.onDragEnd(event, dragdrop.dragElement, node);
				}
			});
			dragdrop.dragend(event);
			this.triggerDistance = false;
		}
	},
	click: function (event) {
		if (this.node) {
			var x = Math.abs(event.pageX - this.pageX);
			var y = Math.abs(event.pageY - this.pageY);
			if (x >= this.distance || y >= this.distance) {
				event.stopPropagation();
			}
			this.node = null;
		}
	}
};

export default handleEvent;
