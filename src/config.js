// 常量
export const CONSTANT = {
	THROTTLE_TIME: 14,                               // 节流函数的间隔时间单位ms, FPS : 1000 / CONSTANT.THROTTLE_TIME
	MEDIA_QUERY_SMALL: 768,                          // 分辨率768px
	MEDIA_QUERY_MID: 992,                           // 分辨率992px
	MEDIA_QUERY_BIG: 1200,                          // 分辨率1200px
	FG_CONTAINER: 'fg-container',                   // 拖拽容器classname
	FG_LAYOUT: 'fg-layout',                         // 拖拽容器的布局区classname
	FG_LAYOUT_DRAGGABLE: 'data-fg-draggable',       // 布局区拖拽属性
	FG_LAYOUT_RESIZABLE: 'data-fg-resizable',       // 布局区缩放属性
	FG_LAYOUT_INDEX: 'data-fg-index',               // 布局区编号
	FG_ITEM: 'fg-item',                             // 拖拽块classname
	FG_ITEM_ANIMATE: 'fg-item-animate',             // 拖拽块classname 动画效果
	FG_ITEM_CONTENT: 'fg-item-content',             // 拖拽块的展示内容区div的classname
	FG_ITEM_ZOOM_BAR: 'fg-zoom-bar',                // 拖拽块内部放大缩小div的classname
	FG_ITEM_ZOOM_BAR_ICO: 'fg-zoom-bar-ico',        // 拖拽块内部放大缩小div里面图标的classname
	FG_ITEM_DRAG_BAR: 'fg-drag-bar',                // 拖拽块可以进行拖拽div的classname
	FG_ITEM_DRAG_BAR_ICO: 'fg-drag-bar-ico',        // 拖拽块可以进行拖拽div里面图标的classname
	FG_ITEM_GRAG_DROP: 'fg-item-dragdrop',          // 正在拖拽的块classname
	FG_ITEM_PLACEHOLDER: 'fg-item-placeholder',     // 拖拽块的占位符
	FG_ITEM_DATA_ID: 'data-fg-id',                  // 拖拽块的数据标识id
	PLACEHOLDER: 'placeholder'                      // 占位符
}

const f = function () {};

// 全局配置
export const globalConfig = {
	className: '',                                     // 自定义换肤class
	row: 7,                                            // 网格布局的默认行,默认7行
	col: 12,                                           // 网格布局的默认列,默认12列
	container: null,                                   // 网格容器的dom对象
	distance: 5,                                       // 触发拖拽的拖拽距离,默认5px
	draggable: true,                                   // 是否允许拖拽, 默认允许
	resizable: true,                                   // 是否允许缩放, 默认允许
	isDragBar: false,                                  // 是否启用拖拽句柄, 默认不启明
	nodeMinW: 2,                                       // 节点块的最小宽度, 默认占2格
	nodeMinH: 2,                                       // 节点块的最小高度, 默认占2格
	overflow: 5,                                       // 当拖拽或缩放超出网格容器的溢出像素
	padding: {                                         // 节点块之间的间距, 默认都为5px
		top: 5,
		left: 5,
		right: 5,
		bottom: 5
	},
	cellScale: {                                       // 单元格的宽高比例, 默认16:9
		w: 16,
		h: 9
	},
	autoAddCell: {                                     // 自动添加节点的默认数据
		x: 0,
		y: 0,
		w: 2,
		h: 2
	},
	onDragStart: f,                                     // 回调函数, 开始拖拽
	onDragEnd: f,                                       // 回调函数, 结束拖拽
	onResizeStart: f,                                   // 回调函数, 开始缩放
	onResizeEnd: f,                                     // 回调函数, 结束拖拽
	onAddNode: f,                                       // 回调函数, 添加节点
	onDeleteNode: f,                                    // 回调函数, 删除节点
	onLoad: f                                           // 回调函数, 重新加载
}
