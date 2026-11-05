<script setup lang="ts">
import KButton from '@/components/button/index'
</script>

<template>
  <p class="href-tip">
    传入 <code>href</code> 后 KButton 渲染为 <code>&lt;a&gt;</code> 锚元素，可正常跳转；<br />
    <code>target="_blank"</code> 时自动补 <code>rel="noopener noreferrer"</code>，也可用
    <code>rel</code> 覆盖；disabled 链接会阻止跳转并带 <code>aria-disabled</code>。
  </p>
  <KButton href="https://ui.kdesign-dev.com/">默认跳转</KButton>
  <KButton type="primary" href="https://ui.kdesign-dev.com/" target="_blank">新窗口打开</KButton>
  <KButton type="success" href="https://ui.kdesign-dev.com/" target="_blank" rel="opener">
    自定义 rel
  </KButton>
  <KButton type="warning" href="https://ui.kdesign-dev.com/" disabled>禁用链接</KButton>
  <KButton type="error" href="https://ui.kdesign-dev.com/" link>link 样式 + href</KButton>
</template>

<style scoped>
.href-tip {
  width: 100%;
  margin: 0 0 4px;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}
.href-tip code {
  padding: 1px 5px;
  border-radius: 4px;
  background: #f1f5f9;
  color: #0a96e6;
  font-size: 12px;
}
</style>
