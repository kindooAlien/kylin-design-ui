<script setup lang="ts">
import KAlert from '@/components/alert/index'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'

// 指南页代码块专用高亮（独立于 demo-block 的配色，互不影响）
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)

/** 对代码字符串做 hljs 高亮，返回 HTML（v-html 渲染，hljs 已转义特殊字符） */
const highlight = (code: string, lang: string): string => {
  try {
    return hljs.highlight(code, { language: lang }).value
  } catch {
    return code
  }
}

/** 各章节示例代码（静态展示，非 ?raw 运行 demo） */
const codeInstall = `# npm
npm install @kindoo/kdesign

# pnpm
pnpm add @kindoo/kdesign

# yarn
yarn add @kindoo/kdesign`

const codeFull = `// main.ts —— 全量引入
import { createApp } from 'vue'
import KylinUI from '@kindoo/kdesign'
import '@kindoo/kdesign/dist/index.css'
import App from './App.vue'

createApp(App).use(KylinUI).mount('#app')

// 全量注册后即可在任意模板中直接使用全部 K 前缀组件
// <KButton type="primary">按钮</KButton>`

const codeTree = `// 按需引入：只打包用到的组件（sideEffects 已标注，支持 Tree-shaking）
<script setup lang="ts">
import { KButton, KSelect, notice } from '@kindoo/kdesign'
import '@kindoo/kdesign/dist/index.css'
<\/script>

<template>
  <KButton type="primary" @click="notice.success('保存成功')">保存</KButton>
</template>`

const codeSingle = `// 单组件全局注册：app.use(KXxx)
import { createApp } from 'vue'
import { KButton, KSwitch } from '@kindoo/kdesign'
import App from './App.vue'

const app = createApp(App)

app.use(KButton) // 全局注册 <KButton />
app.use(KSwitch) // 全局注册 <KSwitch />

app.mount('#app')`

const codeLoading = `// v-loading 指令注册（指令以 Plugin 形式导出，同样用 app.use）
import { createApp } from 'vue'
import { vLoadingDirective } from '@kindoo/kdesign'
import App from './App.vue'

createApp(App).use(vLoadingDirective).mount('#app')

// 模板中使用
// <div v-loading="isLoading">内容区域</div>
// <div v-loading="{ loading: isLoading, text: '拼命加载中...' }">自定义文案</div>`

const codeNotice = `// notice 命令式 API：无需挂载组件，直接调用
import { notice } from '@kindoo/kdesign'

notice.success('保存成功')
notice.error('网络异常，请稍后重试', '详细描述文案')
notice.warning('表单尚未填写完整')
notice.info('提示')
notice.loading('加载中...') // duration 为 0，不自动关闭

// 手动关闭 / 全部清空
const id = notice.success('我会自动消失', undefined, 5000)
notice.dismiss(id)
notice.clear()`

const codeTheme = `/* 主题定制：覆盖全局 CSS 变量即可，无需重新编译 */
:root {
  --k-color-primary: #1677ff;      /* 主色，默认 #1677ff */
  --k-color-success: #22c55e;      /* 成功，默认 #22c55e */
  --k-color-warning: #f59e0b;      /* 警告，默认 #f59e0b */
  --k-color-error: #ed0442;        /* 错误，默认 #ed0442 */
  --k-font-size: 14px;             /* 基准字号 */
}

/* 局部作用域内换肤：在容器上覆盖即可 */
.theme-green {
  --k-color-primary: #00b96b;
}`

const codePublish = `# 发布前清单
# 1. 打包产物
npm run build:lib

# 2. 本地验证产物（可选，用 npm pack 生成 tgz 试装）
npm pack

# 3. 正式发布前：去掉 package.json 中的 "private": true，
#    并确认 name / version / description 已填写

# 4. 发布
npm publish`
</script>

<template>
  <section class="guide-page">
    <h1>安装与使用</h1>
    <p>
      KylinUI 是基于 Vue 3 + TypeScript 的组件库，全部组件以 K 为前缀。
      支持全量安装与按需引入两种方式，且内置 v-loading 指令与 notice 命令式 API。
    </p>

    <section class="guide-page__section">
      <h2>安装</h2>
      <p>使用你熟悉的包管理器安装组件库（请务必使用完整包名 <code>@kindoo/kdesign</code>）：
      </p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeInstall, 'bash')"></code></pre>
      <p class="guide-page__section__notice">
        ⚠️ npm 上存在若干名称相似但与 KDesign 无关的包（如 kdesign、kdesign-ui），
        请一律以本站提供的命令为准，认准 <code>@kindoo/kdesign</code>。
      </p>
    </section>

    <section class="guide-page__section">
      <h2>全量引入</h2>
      <p>
        在入口文件中通过 <code>app.use(KylinUI)</code> 一次性注册全部组件与
        <code>v-loading</code> 指令，并引入一份全量样式：
      </p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeFull, 'typescript')"></code></pre>
      <KAlert type="info">全量引入约 260 KB（gzip 后约 88 KB）样式与脚本，适合内部管理系统等对首屏体积不敏感的场景。</KAlert>
    </section>

    <section class="guide-page__section">
      <h2>按需引入</h2>
      <p>
        只导入用到的组件即可，未引用的组件不会进入产物（package.json 中已通过
        <code>sideEffects</code> 标注 CSS/SCSS 之外的模块均可 Tree-shaking）。
        样式按整包 CSS 引入一次：
      </p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeTree, 'xml')"></code></pre>
    </section>

    <section class="guide-page__section">
      <h2>单组件注册</h2>
      <p>
        每个组件都通过 <code>withInstall</code> 附加了 <code>install</code> 方法，
        可以像插件一样单独全局注册：
      </p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeSingle, 'typescript')"></code></pre>
    </section>

    <section class="guide-page__section">
      <h2>v-loading 指令</h2>
      <p>加载指令以 <code>vLoadingDirective</code> 导出，注册后即可在任意元素上使用：</p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeLoading, 'typescript')"></code></pre>
    </section>

    <section class="guide-page__section">
      <h2>notice 命令式 API</h2>
      <p>无需在模板中挂载组件，直接导入 <code>notice</code> 即可发起全局通知：</p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeNotice, 'typescript')"></code></pre>
      <KAlert type="warning">notice 通知的渲染依赖 KNotice 组件，全量引入时已自动注册；按需使用时请同时引入 KNotice 并挂载在应用根部。</KAlert>
    </section>

    <section class="guide-page__section">
      <h2>主题定制</h2>
      <p>
        组件样式基于全局 CSS 变量（Design Tokens）实现，覆盖变量即可完成换肤，
        无需修改任何组件代码：
      </p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codeTheme, 'css')"></code></pre>
    </section>

    <section class="guide-page__section">
      <h2>发布到 npm</h2>
      <p>组件库源码与演示站同仓维护，发布流程如下：</p>
      <pre class="guide-page__code"><code class="hljs" v-html="highlight(codePublish, 'bash')"></code></pre>
      <KAlert type="success">
        发布产物：<code>dist/index.js</code>（ESM）、<code>dist/index.umd.cjs</code>（UMD）、
        <code>dist/index.css</code>（全量样式）与完整的 <code>.d.ts</code> 类型声明，
        TypeScript 项目可直接获得组件 Props 提示。
      </KAlert>
    </section>
  </section>
</template>

<style scoped lang="scss">
.guide-page {
  padding: 24px;

  h1 {
    margin-bottom: 8px;
  }

  > p {
    margin: 0 0 24px;
    color: var(--k-color-text-secondary);
  }

  &__section {
    margin-bottom: 32px;

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0 0 12px;
      color: var(--k-color-text-secondary);
      font-size: 14px;
    }

    &__notice {
      margin-top: 8px;
      padding: 10px 14px;
      font-size: 13px;
      color: var(--k-color-text-secondary);
      background: var(--k-color-warning-bg, #fff7e6);
      border: 1px solid var(--k-color-warning-border, #ffd591);
      border-radius: var(--k-border-radius, 6px);

      :deep(code) {
        background: rgba(0, 0, 0, 0.06);
        font-size: 12px;
      }
    }

    :deep(code) {
      padding: 1px 6px;
      font-family: 'SFMono-Regular', Consolas, Menlo, monospace;
      font-size: 13px;
      color: var(--k-color-primary);
      background: var(--k-color-bg-secondary);
      border-radius: 4px;
    }
  }

  &__code {
    margin: 0 0 16px;
    padding: 16px 20px;
    overflow: auto;
    // 复用全局 --k-code-* 主题变量：浅色浅灰底彩字，暗色模式自动切换，与 DemoBlock 同源不同处
    background: var(--k-code-bg);
    border: 1px solid var(--k-color-border);
    border-radius: 8px;

    code {
      padding: 0;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      line-height: 1.7;
      color: var(--k-code-text);
      background: transparent;
      border-radius: 0;
      white-space: pre;
    }

    // ---- hljs token → 主题变量映射（跟随明暗主题联动） ----
    :deep(.hljs-keyword),
    :deep(.hljs-selector-tag),
    :deep(.hljs-literal),
    :deep(.hljs-doctag),
    :deep(.hljs-deletion) {
      color: var(--k-code-keyword);
    }

    :deep(.hljs-string),
    :deep(.hljs-regexp),
    :deep(.hljs-addition),
    :deep(.hljs-attr),
    :deep(.hljs-attribute) {
      color: var(--k-code-string);
    }

    :deep(.hljs-comment),
    :deep(.hljs-quote) {
      color: var(--k-code-comment);
    }

    :deep(.hljs-number),
    :deep(.hljs-literal),
    :deep(.hljs-symbol),
    :deep(.hljs-meta) {
      color: var(--k-code-number);
    }

    :deep(.hljs-tag),
    :deep(.hljs-name) {
      color: var(--k-code-tag);
    }

    :deep(.hljs-title),
    :deep(.hljs-title.function_),
    :deep(.hljs-class .hljs-title),
    :deep(.hljs-built_in),
    :deep(.hljs-type),
    :deep(.hljs-builtin-name),
    :deep(.hljs-selector-class),
    :deep(.hljs-selector-id) {
      color: var(--k-code-class);
    }

    :deep(.hljs-variable),
    :deep(.hljs-template-variable),
    :deep(.hljs-params) {
      color: var(--k-code-text);
    }
  }

  :deep(.alert) {
    margin-top: 4px;
  }
}
</style>
