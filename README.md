# flowgrid

flowgrid.js is a plugin for widget layout, 一个轻量简单的网格流布局插件

因为github中docs是github.io的展示页面目录, 我就把构建后最终代码放在这里了, 没有放入约定俗成的dist目录中. 见谅.

发布npm

完善demo 演示地址

css样式要说明一下

### 简介

使用 babel + rollup + vue 构建使用, npm地址:

### 参考图

### 使用说明

    fg-item的node属性的数据格式说明:
      {
        id:'2',   // 唯一标识
        x: 0,     // 坐标 x
        y: 0,     // 坐标 y
        w: 4,     // 宽度
        h: 4,     // 高度
        minW: 2,  // 最小宽度
        minH: 2   // 最小高度
      }

### API使用示例

### flowgrid对象的属性和方法

### flowgrid实例的属性和方法

### 更新日志

v1.2.1
  1. 使用vue来构建源码, 蹭蹭热度, 支持以vue的方式来使用.
  2. 优化了部分代码, 补充注释.
  3. 修复缩放拖拽时状态判断不准确的问题
  4. 修复拖拽过程中文本选中的问题, 动态给body加user-select:none
  5. 使用getBoundingClientRect()来计算节点偏移
  6.

### 版权
  MIT
