<script setup lang="ts">
import DemoBlock from '@/components/demo-block.vue'
import KButton from '@/components/button/index'
import KButtonGroup from '@/components/button-group/index'
import APITable from '@/components/api-table/index.vue'
import { apiProps, apiEmits, apiSlots } from './api-data'
import SquareButtonDemo from './demos/square-button.vue'
import HrefButtonsDemo from './demos/href-buttons.vue'

// 用 ?raw 导入各用例源码片段，作为 DemoBlock 的 code 展示
import defaultButtonCode from './demos/default-button.vue?raw'
import typeButtonsCode from './demos/type-buttons.vue?raw'
import lightButtonsCode from './demos/light-buttons.vue?raw'
import sizeButtonsCode from './demos/size-buttons.vue?raw'
import roundButtonsCode from './demos/round-buttons.vue?raw'
import disabledButtonsCode from './demos/disabled-buttons.vue?raw'
import loadingButtonsCode from './demos/loading-buttons.vue?raw'
import customStyleCode from './demos/custom-style.vue?raw'
import disabledLoadingCode from './demos/disabled-loading.vue?raw'
import iconButtonsCode from './demos/icon-buttons.vue?raw'
import textButtonsCode from './demos/text-buttons.vue?raw'
import linkButtonsCode from './demos/link-buttons.vue?raw'
import hrefButtonsCode from './demos/href-buttons.vue?raw'
import buttonGroupCode from './demos/button-group.vue?raw'
import squareButtonCode from './demos/square-button.vue?raw'
</script>

<template>
  <section class="button-demo">
    <h1>Button 组件用例</h1>
    <p>参考 Element Plus Button 风格的演示。</p>

    <DemoBlock title="默认按钮" description="default 白底灰字。" :code="defaultButtonCode">
      <KButton>Default</KButton>
    </DemoBlock>

    <DemoBlock
      title="深色按钮"
      description="type 控制颜色，实心白字（primary #0A96E6 / success #22C55E / info #14B8A6 / warning #F59E0B / error #ED0442），hover 颜色更深。"
      :code="typeButtonsCode"
    >
      <KButton plain>Default</KButton>
      <KButton type="primary">Primary</KButton>
      <KButton type="success">Success</KButton>
      <KButton type="info">Info</KButton>
      <KButton type="warning">Warning</KButton>
      <KButton type="error">Error</KButton>
    </DemoBlock>

    <DemoBlock
      title="浅色按钮"
      description="plain 浅底深字（primary #CCECFF/#0A96E6 / success #DCFCE7/#15803D / info #CBEFEB/#0D776C / warning #FDEAC9/#77500D / error #FFDCE2/#ED0442），hover bg 稍深。"
      :code="lightButtonsCode"
    >
      <KButton plain>Default</KButton>
      <KButton type="primary" plain>Primary</KButton>
      <KButton type="success" plain>Success</KButton>
      <KButton type="info" plain>Info</KButton>
      <KButton type="warning" plain>Warning</KButton>
      <KButton type="error" plain>Error</KButton>
    </DemoBlock>

    <DemoBlock title="不同尺寸" description="size: large(40px) / middle / small / mini。" :code="sizeButtonsCode">
      <KButton size="large" type="primary">Large</KButton>
      <KButton size="middle" type="primary">Middle</KButton>
      <KButton size="small" type="primary">Small</KButton>
      <KButton size="mini" type="primary">Mini</KButton>
    </DemoBlock>

    <DemoBlock title="圆角按钮" description="round 圆角。" :code="roundButtonsCode">
      <KButton round type="primary">Round</KButton>
      <KButton type="success" round>Success</KButton>
      <KButton type="warning" round>Warning</KButton>
      <KButton type="error" round>Error</KButton>
    </DemoBlock>

    <DemoBlock
      title="禁用状态"
      description="disabled 按 type 用浅色（primary #CCECFF/#0A96E6 等）；disabled dark 灰禁用（#d3ddec #97a4b5）。hover 稍深。"
      :code="disabledButtonsCode"
    >
      <KButton type="primary" disabled>Primary</KButton>
      <KButton disabled>Default</KButton>
      <KButton disabled dark>Dark</KButton>
    </DemoBlock>

    <DemoBlock title="加载中" description="loading 显示 spinner。" :code="loadingButtonsCode">
      <KButton type="primary" loading>Loading</KButton>
      <KButton type="success" loading>Loading</KButton>
    </DemoBlock>

    <DemoBlock
      title="自定义样式"
      description="支持 style 内联 + class 透传（Vue 3 自动 fallthrough 到根 button）。"
      :code="customStyleCode"
    >
      <KButton type="primary" style="box-shadow: 0 2px 8px rgba(10, 150, 230, 0.3)"
        >style 内联</KButton
      >
      <KButton type="primary" class="custom-btn">class 透传</KButton>
    </DemoBlock>

    <DemoBlock
      title="优化后的 disabled 与 loading"
      description="
        1) loading 时自动同步 disabled 状态 (is-interactive-disabled)，防止重复提交；<br/>
        2) 新增 aria-disabled、aria-busy 提升可访问性；<br/>
        3) 移除了 !important，样式更易于扩展；<br/>
        4) 禁用态采用 :disabled 伪类选择器，语义更清晰。
      "
      :code="disabledLoadingCode"
    >
      <KButton type="primary" disabled>Disabled</KButton>
      <KButton type="primary" loading>Loading</KButton>
      <KButton disabled loading>Both disabled & loading</KButton>
      <KButton loading>Loading Success</KButton>
      <KButton disabled loading dark>Both disabled & loading</KButton>
      <KButton loading dark>Loading Success</KButton>
    </DemoBlock>

    <DemoBlock
      title="图标按钮"
      description="icon 属性传 iconfont name（走 KIcon）；或 circle 圆形图标按钮。"
      :code="iconButtonsCode"
    >
      <KButton type="primary" icon="search">搜索</KButton>
      <KButton type="primary" icon="search" circle />
      <KButton type="error" icon="delete" circle />
    </DemoBlock>

    <DemoBlock
      title="方形按钮"
      description="square 纯正方形按钮：简化样式，默认 20px，可用 width/height 自定义宽高；保留 type/plain/round/disabled 等常规能力，也可用 style 自定义背景色。"
      :code="squareButtonCode"
    >
      <SquareButtonDemo />
    </DemoBlock>

    <DemoBlock title="文字按钮" description="text 透明底，hover 浅底。" :code="textButtonsCode">
      <KButton text>Default</KButton>
      <KButton type="primary" text>Primary</KButton>
      <KButton type="success" text>Success</KButton>
      <KButton type="warning" text>Warning</KButton>
      <KButton type="error" text>Error</KButton>
    </DemoBlock>

    <DemoBlock title="链接按钮" description="link 超链接样式，hover 下划线。" :code="linkButtonsCode">
      <KButton link>Default</KButton>
      <KButton type="primary" link>Primary</KButton>
      <KButton type="success" link>Success</KButton>
      <KButton type="warning" link>Warning</KButton>
      <KButton type="error" link>Error</KButton>
    </DemoBlock>

    <DemoBlock
      title="跳转链接（href）"
      description="传入 href 渲染为 <a> 锚元素；target=_blank 自动补 noopener noreferrer；disabled 阻止跳转。可与 link/text/plain 等样式组合。"
      :code="hrefButtonsCode"
    >
      <HrefButtonsDemo />
    </DemoBlock>

    <DemoBlock title="按钮组" description="ButtonGroup 组合多个按钮，相邻边框合并、首尾圆角。" :code="buttonGroupCode">
      <KButtonGroup>
        <KButton>Default</KButton>
        <KButton type="primary">Primary</KButton>
        <KButton type="success">Success</KButton>
      </KButtonGroup>
      <KButtonGroup>
        <KButton type="primary" plain>上一页</KButton>
        <KButton type="primary" plain>1</KButton>
        <KButton type="primary" plain>2</KButton>
        <KButton type="primary" plain>下一页</KButton>
      </KButtonGroup>
    </DemoBlock>

    <!-- API 文档表格 -->
    <section class="button-demo__api">
      <h2>API</h2>
      <APITable :props="apiProps" :emits="apiEmits" :slots="apiSlots" />
    </section>
  </section>
</template>

<style scoped lang="scss">
.button-demo {
  padding: 24px;

  h1 {
    margin-bottom: 8px;
  }

  > p {
    margin: 0 0 24px;
    color: #666;
  }

  :deep(.demo-block__body) {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .custom-btn {
    border: 2px dashed #0a96e6 !important;
    background: transparent !important;
    color: #0a96e6 !important;
  }

  &__api {
    margin-top: 56px;
    padding-top: 32px;
    border-top: 1px solid var(--k-color-border);

    h2 {
      margin: 0 0 16px;
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
