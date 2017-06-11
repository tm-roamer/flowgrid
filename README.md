# flowgrid

flowgrid.js is a plugin for vue widget layout, 一个基于vue的轻量简单的网格流布局插件

### 备注

因为/docs是github.io的默认目录, 我就把构建后代码放这里了, 没有放入约定俗成的/dist中, 见谅.

### 简介

flowgrid是vue插件, 使用 babel + rollup + uglifyjs 来进行源码构建.

### npm

[flowgrid的npm地址](https://www.npmjs.com/package/flowgrid). https://www.npmjs.com/package/flowgrid

### 参考图

![github](https://github.com/tm-roamer/flowgrid/blob/master/readme/demo_small_1.gif?raw=true "demo")

### 使用方式

1. /docs/flowgrid.min.js npm install安装后可以直接import使用

2. /src/源码 直接copy到项目工程进行使用, 方便定制

### 源码说明

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

### 更新日志

v1.2.2
  1. 完善readme文档
v1.2.1
  1. 使用vue来构建源码, 蹭蹭热度, 支持以vue的方式来使用.
  2. 优化了部分代码, 补充注释.
  3. 修复缩放拖拽时状态判断不准确的问题
  4. 修复拖拽过程中文本选中的问题, 动态给body加user-select:none
  5. 使用getBoundingClientRect()来计算节点偏移

### 版权
  MIT
