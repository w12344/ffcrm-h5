# Design System

## 📋 概述

统一的设计系统，为 Boss、Shop 和 TargetStrategy 页面提供一致的视觉风格和组件库。

## 🎯 设计原则

1. **一致性**: 所有页面使用相同的颜色、字体、间距
2. **可维护性**: 集中管理设计 tokens，易于全局更新
3. **可复用性**: 提供可复用的组件类和 mixins
4. **可扩展性**: 易于添加新的组件和样式

## 📁 文件结构

```
design-system/
├── tokens.less       # 设计 tokens（颜色、字体、间距等）
├── mixins.less       # LESS mixins（可复用样式模式）
├── components.less   # 组件样式类
├── index.less        # 主入口文件
└── README.md         # 本文档
```

## 🎨 设计 Tokens

### 字体

```less
// 字体家族
@font-family-base: 'Inter', sans-serif;        // 基础字体
@font-family-numeric: 'Rajdhani', sans-serif;  // 数字字体
@font-family-heading: 'Inter', sans-serif;     // 标题字体

// 字体大小（统一尺度）
@font-size-xs: 11px;      // 小标签
@font-size-sm: 12px;      // 副标题
@font-size-base: 14px;    // 正文
@font-size-md: 16px;      // 强调文本
@font-size-lg: 18px;      // 小标题
@font-size-xl: 20px;      // 卡片标题
@font-size-2xl: 24px;     // 区域标题
@font-size-3xl: 28px;     // 页面标题
@font-size-4xl: 34px;     // 英雄标题

// 字重
@font-weight-normal: 400;
@font-weight-medium: 500;
@font-weight-semibold: 600;
@font-weight-bold: 700;
@font-weight-extrabold: 800;
@font-weight-black: 900;
```

### 颜色

```less
// 主色
@color-primary: #2563EB;
@color-primary-light: #3B82F6;
@color-primary-dark: #1E40AF;

// 背景色
@color-bg-base: #F8FAFC;        // 页面背景
@color-bg-elevated: #FFFFFF;    // 卡片背景
@color-bg-subtle: #F1F5F9;      // 输入框背景
@color-bg-muted: #E2E8F0;       // 悬停背景

// 文本色
@color-text-primary: #0F172A;      // 主要文本
@color-text-secondary: #475569;    // 次要文本
@color-text-tertiary: #64748B;     // 三级文本
@color-text-quaternary: #94A3B8;   // 四级文本

// 状态色
@color-success: #10B981;
@color-warning: #F59E0B;
@color-error: #EF4444;
@color-info: #3B82F6;
```

### 间距

```less
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 12px;
@spacing-base: 16px;
@spacing-lg: 20px;
@spacing-xl: 24px;
@spacing-2xl: 32px;
@spacing-3xl: 40px;
@spacing-4xl: 48px;
@spacing-5xl: 64px;
```

### 圆角

```less
@radius-sm: 8px;
@radius-base: 12px;
@radius-md: 14px;
@radius-lg: 16px;
@radius-xl: 20px;
@radius-2xl: 24px;
@radius-3xl: 32px;
@radius-full: 9999px;
```

## 🧩 组件类

### 页面头部

```less
.ds-page-header {
  height: 100px;
  padding: 0 40px;
  // ...
}
```

### Logo

```less
.ds-logo {
  width: 64px;
  height: 64px;
  background: @color-primary;
  // ...
}

.ds-logo-sm {
  width: 56px;
  height: 56px;
}
```

### 标题组

```less
.ds-title-group {
  .main-title { /* 主标题 */ }
  .sub-title { /* 副标题 */ }
}
```

### 切换器

```less
.ds-switcher {
  .switch-item { /* 切换项 */ }
  .switch-item.active { /* 激活状态 */ }
}
```

### 卡片

```less
.ds-card {
  background: #fff;
  border-radius: 32px;
  padding: 32px 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### 指标显示

```less
.ds-metric {
  .label { /* 标签 */ }
  .value-group { /* 数值组 */ }
  .status-text { /* 状态文本 */ }
}
```

### 表格

```less
.ds-table {
  .table-header { /* 表头 */ }
  .table-body { /* 表体 */ }
  .table-row { /* 行 */ }
}
```

### 按钮

```less
.ds-btn-primary { /* 主按钮 */ }
.ds-btn-secondary { /* 次按钮 */ }
```

### 输入框

```less
.ds-input {
  height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  // ...
}
```

## 🛠️ Mixins

### 排版 Mixins

```less
.text-page-title()      // 页面标题
.text-section-title()   // 区域标题
.text-card-title()      // 卡片标题
.text-subtitle()        // 副标题
.text-body()            // 正文
.text-numeric-large()   // 大数字
.text-numeric-medium()  // 中数字
.text-numeric-small()   // 小数字
.text-label()           // 标签
.text-caption()         // 说明文字
```

### 布局 Mixins

```less
.flex-center()          // 居中对齐
.flex-between()         // 两端对齐
.flex-column()          // 纵向布局
.absolute-center()      // 绝对居中
```

### 卡片 Mixins

```less
.card-base()            // 基础卡片
.card-hover()           // 悬停效果
.card-glass()           // 玻璃态
```

### 输入框 Mixins

```less
.input-base()           // 基础输入框
```

### 按钮 Mixins

```less
.button-primary()       // 主按钮
.button-secondary()     // 次按钮
```

### 徽章 Mixins

```less
.pill-filter()          // 筛选徽章
.badge-status(@color)   // 状态徽章
```

### 动画 Mixins

```less
.animation-pulse()      // 脉冲动画
.animation-fade-in()    // 淡入
.animation-slide-up()   // 上滑
```

### 工具 Mixins

```less
.truncate()             // 文本截断
.line-clamp(@lines)     // 多行截断
.scrollbar-custom()     // 自定义滚动条
```

## 📖 使用指南

### 1. 导入设计系统

```less
// 在你的 .less 文件中
@import '@/styles/design-system/index.less';
```

### 2. 使用 Tokens

```less
.my-component {
  font-size: @font-size-base;
  color: @color-text-primary;
  padding: @spacing-xl;
  border-radius: @radius-base;
}
```

### 3. 使用 Mixins

```less
.my-title {
  .text-page-title();
}

.my-card {
  .card-base();
  .card-hover();
}

.my-button {
  .button-primary();
}
```

### 4. 使用组件类

```html
<div class="ds-page-header">
  <div class="header-left">
    <div class="ds-logo">...</div>
    <div class="ds-title-group">
      <h1 class="main-title">TITLE</h1>
      <div class="sub-title">Subtitle</div>
    </div>
  </div>
</div>
```

## 🎯 页面应用示例

### Boss 页面

```less
@import '@/styles/design-system/index.less';

.boss-page {
  background: @color-bg-base;
  font-family: @font-family-base;
  
  .command-header {
    .ds-page-header();
  }
  
  .main-title {
    .text-page-title();
  }
}
```

### Shop 页面

```less
@import '@/styles/design-system/index.less';

.shop-group-dashboard-v2 {
  background: @color-bg-base;
  font-family: @font-family-base;
  
  .command-header {
    .ds-page-header();
  }
}
```

### TargetStrategy 页面

```less
@import '@/styles/design-system/index.less';

.target-strategy-page {
  background: @color-bg-base;
  font-family: @font-family-base;
  
  .page-header {
    .ds-page-header();
  }
  
  .overview-card {
    .card-base();
  }
}
```

## 🔄 迁移指南

### 步骤 1: 导入设计系统

在现有的 `.less` 文件顶部添加：

```less
@import '@/styles/design-system/index.less';
```

### 步骤 2: 替换硬编码值

**之前:**
```less
.title {
  font-size: 34px;
  font-weight: 900;
  color: #0F172A;
}
```

**之后:**
```less
.title {
  .text-page-title();
}
```

### 步骤 3: 使用组件类

**之前:**
```less
.my-card {
  background: #fff;
  border-radius: 32px;
  padding: 32px 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

**之后:**
```less
.my-card {
  .card-base();
}
```

## 📊 一致性检查清单

- [ ] 所有页面使用相同的字体家族
- [ ] 所有标题使用统一的字体大小尺度
- [ ] 所有颜色来自设计 tokens
- [ ] 所有间距使用统一的间距尺度
- [ ] 所有圆角使用统一的圆角尺度
- [ ] 所有卡片使用相同的样式
- [ ] 所有按钮使用相同的样式
- [ ] 所有输入框使用相同的样式

## 🎨 设计规范

### 字体使用规范

| 元素 | 字体大小 | 字重 | 字体家族 |
|------|---------|------|---------|
| 页面标题 | 34px | 900 | Inter |
| 区域标题 | 28px | 800 | Inter |
| 卡片标题 | 20px | 700 | Inter |
| 正文 | 14px | 400 | Inter |
| 大数字 | 48px | 800 | Rajdhani |
| 中数字 | 28px | 800 | Rajdhani |
| 小数字 | 18px | 700 | Rajdhani |

### 间距使用规范

| 场景 | 间距值 |
|------|--------|
| 组件内小间距 | 8px |
| 组件内中间距 | 16px |
| 组件内大间距 | 24px |
| 组件间间距 | 32px |
| 区域间间距 | 40px |

### 颜色使用规范

| 用途 | 颜色 |
|------|------|
| 主要文本 | #0F172A |
| 次要文本 | #475569 |
| 辅助文本 | #64748B |
| 占位文本 | #94A3B8 |
| 主色 | #2563EB |
| 成功 | #10B981 |
| 警告 | #F59E0B |
| 错误 | #EF4444 |

## 🚀 最佳实践

1. **优先使用 Mixins**: 而不是直接使用 tokens
2. **使用语义化类名**: 如 `.ds-card` 而不是 `.white-box`
3. **保持一致性**: 相同的元素使用相同的样式
4. **避免硬编码**: 所有值都应该来自设计系统
5. **文档化自定义**: 如果需要自定义样式，添加注释说明原因

## 📝 更新日志

### v1.0.0 (2026-01-09)
- 初始版本
- 创建设计 tokens
- 创建 mixins 库
- 创建组件类库
- 添加完整文档

## 🤝 贡献指南

添加新的设计 token 或组件时：

1. 在 `tokens.less` 中添加新的 token
2. 在 `mixins.less` 中添加对应的 mixin
3. 在 `components.less` 中添加组件类
4. 更新本 README 文档
5. 在至少一个页面中使用并验证

## 📄 许可

内部使用 - Feifan Portal Project
