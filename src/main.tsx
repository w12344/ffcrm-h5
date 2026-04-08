import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./App.css";

// 引入CSS变量，支持动态主题切换
import "./styles/variables.css";
import "@arco-design/mobile-react/esm/style";

// 引入antd样式
import "antd/dist/reset.css";

// 引入Arco Design样式（由于配置了按需引入插件，这里不再需要全局引入）
// import '@arco-design/mobile-react/esm/style'

// 引入flexible.js进行自适应适配
// import setRootPixel from '@arco-design/mobile-react/tools/flexible';

// 引入PC端兼容性支持
// import '@arco-design/mobile-react/tools/touch2mouse';

// 设置响应式基础字号
function setRootFontSize() {
  const docEl = document.documentElement;
  const clientWidth = docEl.clientWidth;

  let fontSize: number;

  // 基准设计宽度和基准字号
  const baseWidth = 1920;
  const baseFontSize = 37.5;

  // PC端根据屏幕宽度等比例缩放，但保持较大的最小字号以确保可读性
  // 优化策略：小屏幕下保持更大的根字号，让布局缩小但字体保持清晰
  if (clientWidth >= 1920) {
    // 超大屏幕，保持1920的基准
    fontSize = baseFontSize;
  } else if (clientWidth >= 1600) {
    // 大屏幕（1600-1920），等比例缩放，最小35px
    fontSize = Math.max(35, (clientWidth / baseWidth) * baseFontSize);
  } else if (clientWidth >= 1366) {
    // 常见笔记本屏幕（1366-1600），最小35px，保持字体清晰
    fontSize = Math.max(35, (clientWidth / baseWidth) * baseFontSize);
  } else if (clientWidth >= 1280) {
    // 小笔记本屏幕（1280-1366），固定35px，字体不再缩小
    fontSize = 35;
  } else if (clientWidth >= 1024) {
    // 平板横屏/小屏PC（1024-1280），固定35px
    fontSize = 35;
  } else if (clientWidth >= 900) {
    // 小屏PC/平板（900-1024），固定35px
    fontSize = 35;
  } else if (clientWidth >= 768) {
    // 平板尺寸（768-900），固定35px
    fontSize = 35;
  } else {
    // 移动端，基于375的设计稿
    const mobileBaseWidth = 375;
    const mobileFontSize = 37.5;
    fontSize =
      (Math.max(320, Math.min(clientWidth, 480)) / mobileBaseWidth) *
      mobileFontSize;
  }

  docEl.style.fontSize = fontSize + "px";
}


// 页面加载时设置
setRootFontSize();

// 窗口大小改变时重新设置
window.addEventListener("resize", setRootFontSize);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
