import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import px2rem from 'postcss-plugin-px2rem'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.GITHUB_ACTIONS ? '/ffcrm-h5/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 8070,
    open: true,
    strictPort: true, // 端口被占用时不会自动尝试下一个可用端口
    proxy: {
      // API代理配置
      '/api': {
        // target: 'http://192.168.1.31:8081',
        target: 'http://47.120.3.7:8080',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 微信相关API代理（如果需要）
      '/wechat': {
        target: 'https://api.weixin.qq.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/wechat/, ''),
      },
      // OSS PDF 文件代理，用于修改响应头实现预览而非下载
      '/oss-pdf': {
        target: 'https://ffjy-data.oss-cn-heyuan.aliyuncs.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/oss-pdf/, ''),
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // 修改响应头，让浏览器预览而不是下载
            proxyRes.headers['content-disposition'] = 'inline';
            proxyRes.headers['content-type'] = 'application/pdf';
            // 允许跨域
            proxyRes.headers['access-control-allow-origin'] = '*';
            console.log('PDF Proxy Response:', req.url);
          });
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        px2rem({
          rootValue: 37.5,
          exclude: /(node_modules|antd)/,
        }),
      ],
    },
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
        // 配置别名，解决 ~@ 开头的模块路径问题
        modifyVars: {},
        // 添加全局变量或 mixin
        additionalData: '',
        // 自定义 less 导入解析
        paths: ['node_modules'],
      },
    },
  },
  resolve: {
    alias: {
      // 处理以 ~ 开头的模块路径
      '~@arco-design/mobile-utils': '@arco-design/mobile-utils',
      '~@arco-design': '@arco-design',
      // 添加 @ 别名指向 src 目录
      '@': path.resolve(__dirname, 'src'),
    },
  },
}))
