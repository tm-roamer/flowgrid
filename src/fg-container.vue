<template>
  <div class="fg-container">
    <div class="fg-layout">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
      }
    }
  }
</script>

<style>
  .fg-container {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
  .fg-layout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .fg-layout[data-fg-resizable="false"] .fg-item-zoom-bar {
    display: none;
  }
  .fg-layout[data-fg-resizable="false"] .fg-item {
    cursor: default;
  }

  @media screen and (max-width: 767px) {
    .fg-layout {
      width: auto !important;
      margin: 0 10px;
    }
    .fg-layout:after {
      content: "";
      clear: both;
    }
    .fg-layout .fg-item-zoom {
      display: none;
    }
    .fg-item {
      position: static;
      width: 100% !important;
      height: auto !important;
      float: left !important;
      transform: translate(0, 0) !important;
      margin-bottom: 10px;
    }
  }
  .fg-item {
    cursor: pointer;
    -webkit-user-select:none;
    -moz-user-select:none;
    position: absolute;
    z-index: 10;
    background-color: #fff;
  }
  .fg-item-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .fg-item-zoom-bar {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 24px;
    width: 24px;
    overflow: hidden;
    z-index: 2147483647;
    cursor: se-resize;
  }
  .fg-item-zoom-bar:before {
    content: "";
    position: absolute;
    z-index: 2147483647;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .fg-item-dragdrop {
    box-shadow: 2px 2px 2px rgba(144,142,142,0.6);
    opacity: 0.8;
    z-index: 2147483647;
  }
  .fg-item[data-fg-id="placeholder"] {
    background-color: #d3d3d3;
    z-index: 1;
  }
  .fg-item-animate {
    -webkit-transform: translate3d(0,0,0);
    -webkit-backface-visibility: hidden;
    -webkit-transform-style: preserve-3d;
    transition: transform 0.2s, height 0.2s, width 0.2s;
  }
</style>