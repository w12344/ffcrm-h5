# FFCRM H5 

基于 React + TypeScript + Vite + Arco Design Mobile 的移动端应用项目

## 技术栈

- **React 18** - 用户界面构建库
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Vite** - 现代化的前端构建工具
- **Arco Design Mobile** - 字节跳动移动端组件库
- **PostCSS + px2rem** - 移动端适配方案

## 项目结构

```
ffcrm-h5/
├── public/                 # 静态资源目录
├── src/                    # 源代码目录
│   ├── components/        # 组件目录
│   │   ├── Demo.tsx      # 组件展示页面
│   │   └── Demo.css      # 样式文件
│   ├── App.tsx           # 根组件
│   ├── App.css           # 根组件样式
│   ├── main.tsx          # 应用入口
│   └── index.css         # 全局样式
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 开始使用

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 预览生产版本

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

## 功能特性

### 已集成的 Arco Mobile 组件

项目中已经集成并展示了以下 Arco Design Mobile 组件：

#### 基础组件
- **Button** - 按钮组件（主要按钮、默认按钮、幽灵按钮）
- **Input** - 输入框组件（支持清除功能）
- **Cell** - 单元格组件（支持图标、箭头、自定义右侧内容）

#### 反馈组件
- **Toast** - 轻提示组件
- **Modal** - 模态框组件
- **ActionSheet** - 动作面板组件
- **Progress** - 进度条组件

#### 展示组件
- **Avatar** - 头像组件
- **Badge** - 徽标组件
- **Rate** - 评分组件
- **Divider** - 分割线组件
- **Switch** - 开关组件

#### 导航组件
- **NavBar** - 导航栏组件
- **Tabs** - 标签页组件

### 移动端适配

- 使用 `postcss-plugin-px2rem` 插件实现 px 到 rem 的自动转换
- 基准字体大小设置为 37.5px，适配 375px 宽度的设计稿
- 响应式设计，支持不同屏幕尺寸

### 开发体验

- TypeScript 类型检查
- ESLint 代码规范检查
- 热更新开发体验
- 现代化的构建工具链

## 定制主题

Arco Design Mobile 支持主题定制，你可以通过以下方式自定义主题：

1. 在项目根目录创建 `arco.config.js` 文件
2. 配置主题变量
3. 重新构建项目

更多主题定制信息请参考 [Arco Design Mobile 官方文档](https://arco.design/mobile/react)

## 开发建议

1. 在开发移动端页面时，建议使用浏览器的移动设备模拟器
2. 设计稿基于 375px 宽度时，可直接使用设计稿中的 px 值
3. 组件按需引入，减少打包体积
4. 遵循 React Hooks 最佳实践

## 参考文档

- [React 官方文档](https://react.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [Arco Design Mobile 官方文档](https://arco.design/mobile/react)
- [TypeScript 官方文档](https://www.typescriptlang.org/)