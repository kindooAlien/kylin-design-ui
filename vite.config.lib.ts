import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'

/**
 * 组件库打包配置（与演示站 vite.config.ts 分离，避免互相干扰）。
 *
 * 产物结构（dist/）：
 *  - dist/index.js / index.umd.cjs —— ES / UMD 格式 JS（vue 外置）
 *  - dist 下的 d.ts 文件 —— 类型声明
 *  - dist/index.css —— 全量样式（全量安装时引入一次）
 *
 * 运行：`npm run build:lib`
 */
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    // 生成 .d.ts 类型声明；entryRoot 限制为 src，避免把演示页类型也打进来
    dts({
      // 根 tsconfig 是 solution 风格（files 为空），必须显式指向包含源码的子配置
      tsconfigPath: 'tsconfig.app.json',
      entryRoot: 'src',
      // 只为组件库源码生成声明，排除演示站页面与测试文件
      include: ['src/components/**/*', 'src/utils/**/*'],
      exclude: ['src/components/**/__tests__/**', 'src/**/*.spec.ts', 'src/**/*.test.ts'],
      outDir: 'dist',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // 依赖（如 vue-router）源码中的 process.env.NODE_ENV 若保留到产物，
    // UMD 直开浏览器会因无 process 对象而在工厂函数执行中途抛错、
    // 导出全部丢失（仅剩 __esModule）。构建期直接替换为字面量。
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // 组件库构建无需复制演示站的 public 资源
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/components/index.ts', import.meta.url)),
      name: 'KylinUI',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.umd.cjs'),
      // 产物名固定为 index.css，与 package.json exports 对齐
      cssFileName: 'index',
    },
    rollupOptions: {
      // vue 由使用方提供，不打入产物
      external: ['vue'],
      output: {
        // UMD 格式下的全局变量映射
        globals: { vue: 'Vue' },
        exports: 'named',
      },
    },
    // 样式集中为单个 dist/index.css
    cssCodeSplit: false,
  },
})
