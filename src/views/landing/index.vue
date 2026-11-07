<script setup lang="ts">
import { ref } from 'vue'
import pkg from '../../../package.json'
import { useTheme } from '@/composables/useTheme'
import KScrollBar from '@/components/scrollbar/index'
import type { ScrollBarExposed } from '@/components/scrollbar/index'
import KButton from '@/components/button/index'
import KSwitch from '@/components/switch/index'
import KBadge from '@/components/badge/index'
import KAlert from '@/components/alert/index'
import KInput from '@/components/input/index'
import KProgress from '@/components/progress/index'
import KRate from '@/components/rate/index'
import KSlider from '@/components/slider/index'
import KTag from '@/components/tag/index'
import KIcon from '@/components/icon/index'
import logoLightUrl from '@/assets/logo-light@2x.png'
import logoDarkUrl from '@/assets/logo-dark@2x.png'
import { vReveal } from '@/directives/reveal'
import { useCountUp } from '@/composables/useCountUp'

const { toggleTheme, toggleText, isDark } = useTheme()

/** 顶栏锚点导航（平滑滚动到对应区块） */
const navLinks = [
  { id: 'stage', label: '组件演示' },
  { id: 'features', label: '核心特性' },
  { id: 'components', label: '组件总览' },
  { id: 'cta', label: '快速开始' },
]

/** KScroll 实例：锚点平滑滚动直接操作其内部 wrap 元素 */
const kscrollRef = ref<ScrollBarExposed | null>(null)

/** GitHub 仓库地址（导航/页脚共用） */
const REPO_URL = 'https://github.com/mylions5050/@kindoo/kdesign'

/** 组件库版本（自动取自 package.json，避免文档站与 npm 包版本脱节） */
const LIB_VERSION = pkg.version

const scrollToSection = (id: string) => {
  const wrap = kscrollRef.value?.wrapRef
  if (!wrap) return
  const el = wrap.querySelector(`#${id}`) as HTMLElement | null
  if (!el) return
  const top = el.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop - 76
  wrap.scrollTo({ top, behavior: 'smooth' })
}

/** 三栏玻璃面板舞台的演示状态（真实 K 组件交互） */
const demoProject = ref('企业运营管理平台')
const notifyOn = ref(true)
const quietOn = ref(false)
const demoRate = ref(4)
const demoSlider = ref(60)

/** SupTable 迷你演示的特性标签 */
const supFeatures = ['单元格选择 / 填充柄', '行列增删', '列宽自适应', '列选中', '行 hover']

/** 核心特性六卡 */
const features = [
  {
    icon: '⚡',
    title: '开箱即用',
    desc: 'app.use 一次性注册全部组件与 v-loading 指令，按需引入时未使用组件自动 Tree-shaking，不增加打包体积。',
  },
  {
    icon: '🛡',
    title: 'TypeScript 优先',
    desc: '100% TS 类型覆盖，完整的类型提示与泛型支持，IDE 智能补全即写即所得。',
  },
  {
    icon: '🎨',
    title: 'CSS 变量主题',
    desc: '全量设计 Token 驱动，明暗双主题一键切换，品牌色、圆角、字号均可通过 CSS 变量深度定制。',
  },
  {
    icon: '🧩',
    title: '50+ 高质量组件',
    desc: '从 Button 到 SupTable 超级表格，覆盖表单、数据展示、反馈、导航全部场景，139 个单元测试保驾护航。',
  },
  {
    icon: '📣',
    title: '命令式 API',
    desc: 'notice / message / message-box 支持函数式调用，一行代码完成全局反馈，无需手写模板。',
  },
  {
    icon: '📦',
    title: '轻量体积',
    desc: '全量样式与脚本约 260 KB（gzip 后约 88 KB），核心依赖仅 dayjs 与 async-validator。',
  },
]

/** 组件速览网格（分组 + 文档路由，与侧边栏菜单全量对齐） */
const quickGroups = [
  {
    group: '通用',
    items: [
      { name: 'Button 按钮', path: '/button' },
      { name: 'Icon 图标', path: '/icon' },
      { name: 'Tag 标签', path: '/tag' },
      { name: 'Switch 开关', path: '/switch' },
      { name: 'Tooltip 文字提示', path: '/tooltip' },
      { name: 'InfoPopover 信息提示', path: '/info-popover' },
    ],
  },
  {
    group: '布局',
    items: [
      { name: 'Grid 栅格', path: '/grid' },
      { name: 'Container 布局', path: '/container' },
      { name: 'Card 卡片', path: '/card' },
    ],
  },
  {
    group: '数据录入',
    items: [
      { name: 'Input 输入框', path: '/input' },
      { name: 'Select 选择器', path: '/select' },
      { name: 'Radio 单选框', path: '/radio' },
      { name: 'Checkbox 复选框', path: '/checkbox' },
      { name: 'InputNumber 数字输入', path: '/input-number' },
      { name: 'Form 表单', path: '/form' },
      { name: 'DatePicker 日期', path: '/date-picker' },
      { name: 'TimePicker 时间', path: '/time-picker' },
      { name: 'TimeSelect 时刻', path: '/time-select' },
      { name: 'DateTimePicker 日期时间', path: '/date-time-picker' },
      { name: 'Upload 上传', path: '/upload' },
      { name: 'Cascader 级联', path: '/cascader' },
      { name: 'Rate 评分', path: '/rate' },
      { name: 'Slider 滑块', path: '/slider' },
      { name: 'Transfer 穿梭框', path: '/transfer' },
    ],
  },
  {
    group: '数据展示',
    items: [
      { name: 'Table 表格', path: '/table' },
      { name: 'SupTable 超级表格', path: '/supper-table' },
      { name: 'Tree 树形控件', path: '/tree' },
      { name: 'TreeSelect 树形选择', path: '/tree-select' },
      { name: 'Descriptions 描述', path: '/descriptions' },
      { name: 'Badge 徽标', path: '/badge' },
      { name: 'Avatar 头像', path: '/avatar' },
      { name: 'Progress 进度', path: '/progress' },
      { name: 'Image 图片', path: '/image' },
      { name: 'ScrollBar 滚动条', path: '/scrollbar' },
    ],
  },
  {
    group: '反馈',
    items: [
      { name: 'Alert 警告', path: '/alert' },
      { name: 'Message 提示', path: '/message' },
      { name: 'Notice 通知', path: '/notice' },
      { name: 'MessageBox 弹框', path: '/message-box' },
      { name: 'Result 结果页', path: '/result' },
      { name: 'Dialog 对话框', path: '/dialog' },
      { name: 'Drawer 抽屉', path: '/drawer' },
      { name: 'Loading 加载', path: '/loading' },
      { name: 'Collapse 折叠面板', path: '/collapse' },
    ],
  },
  {
    group: '导航',
    items: [
      { name: 'Menu 菜单', path: '/menu' },
      { name: 'Tabs 页签', path: '/tab' },
      { name: 'Breadcrumb 面包屑', path: '/breadcrumb' },
      { name: 'Steps 步骤条', path: '/steps' },
      { name: 'Pagination 分页', path: '/pagination' },
      { name: 'Dropdown 下拉菜单', path: '/dropdown' },
      { name: 'PageHeader 页头', path: '/page-header' },
    ],
  },
]

/** 统计胶囊：数字进入视口后滚动计数 */
const stats = [
  { end: 50, suffix: '+', label: '企业级组件' },
  { end: 139, suffix: '', label: '单元测试' },
  { end: 100, suffix: '%', label: 'TS 类型覆盖' },
  { end: 2, suffix: '', label: '明暗双主题' },
]

/** 每个统计项一个计数器实例（setup 顶层同步调用，生命周期钩子合法） */
const statCounts = stats.map((s) => useCountUp(s.end))
</script>

<template>
  <div class="landing">
    <!-- 固定毛玻璃导航 -->
    <header class="landing-nav">
      <div class="landing-nav__brand">
        <img :src="isDark() ? logoDarkUrl : logoLightUrl" alt="KDesignUI" class="landing-nav__logo" />
        <span class="landing-nav__name">KDesignUI</span>
      </div>
      <nav class="landing-nav__links">
        <a
          v-for="link in navLinks"
          :key="link.id"
          href="javascript:;"
          @click.prevent="scrollToSection(link.id)"
        >
          {{ link.label }}
        </a>
      </nav>
      <div class="landing-nav__right">
        <a
          class="landing-nav__gh"
          :href="REPO_URL"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub 仓库"
          title="GitHub 仓库"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <button class="landing-nav__theme" :title="toggleText" @click="toggleTheme">
        <svg v-if="isDark()" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="5" fill="currentColor" />
          <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="2.5" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="21.5" y2="12" />
            <line x1="5.3" y1="5.3" x2="6.7" y2="6.7" />
            <line x1="17.3" y1="17.3" x2="18.7" y2="18.7" />
            <line x1="5.3" y1="18.7" x2="6.7" y2="17.3" />
            <line x1="17.3" y1="5.3" x2="18.7" y2="6.7" />
          </g>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
            fill="currentColor"
          />
        </svg>
        <span>{{ isDark() ? '亮色' : '暗色' }}</span>
        </button>
      </div>
    </header>

    <!-- 全页滚动容器 -->
    <KScrollBar ref="kscrollRef" class="landing-scroll">
      <!-- Hero：光晕 + 星点网格 + 渐变标语 -->
      <section class="landing-hero">
        <div class="landing-hero__glow landing-hero__glow--a" />
        <div class="landing-hero__glow landing-hero__glow--b" />
        <div class="landing-hero__grid-bg" />

        <div class="landing-hero__badge">✦ v{{ LIB_VERSION }} · 全量安装 / 按需引入</div>
        <h1 class="landing-hero__title">设计之美<span class="landing-hero__title-sub">企业级 Vue3 组件库</span></h1>
        <p class="landing-hero__desc">
          基于 Vue 3 + TypeScript 打造，50+ 高质量 K 前缀组件开箱即用。
          CSS 变量主题定制，内置 v-loading 指令与 notice 命令式 API，100% TS 类型覆盖。
        </p>
        <div class="landing-hero__cta">
          <RouterLink to="/components" class="landing-btn landing-btn--primary">
            快速开始
            <KIcon name="direction-right" :size="16" />
          </RouterLink>
          <RouterLink to="/components" class="landing-btn landing-btn--ghost">浏览组件</RouterLink>
        </div>
        <div class="landing-hero__stats">
          <div v-for="(s, i) in stats" :key="s.label" class="landing-stat-pill">
            <b :ref="(el) => (statCounts[i].elRef.value = el)">
              {{ statCounts[i].display.value }}{{ s.suffix }}
            </b>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </section>

      <!-- 三栏玻璃面板舞台：真实 K 组件活体演示 -->
      <section id="stage" class="landing-stage">
        <div class="landing-panel">
          <div class="landing-panel__head">
            <span class="landing-panel__title">表单录入</span>
            <span class="landing-panel__tag">KForm · KInput · KSwitch</span>
          </div>
          <div class="landing-field">
            <label>项目名称</label>
            <KInput v-model="demoProject" clearable />
          </div>
          <div class="landing-field">
            <label>通知开关</label>
            <div class="landing-field__row">
              <KSwitch v-model="notifyOn" />
              <span>构建失败时通知</span>
              <KSwitch v-model="quietOn" class="landing-field__switch-gap" />
              <span>夜间静默</span>
            </div>
          </div>
          <div class="landing-field landing-field--last">
            <label>满意度评分</label>
            <KRate v-model="demoRate" :size="16" />
            <KSlider v-model="demoSlider" />
            <div class="landing-field__hint">KSlider · {{ demoSlider }}%</div>
          </div>
        </div>

        <div class="landing-panel">
          <div class="landing-panel__head">
            <span class="landing-panel__title">反馈与状态</span>
            <span class="landing-panel__tag">KAlert · KProgress · KTag</span>
          </div>
          <KAlert type="primary" class="landing-panel__alert">
            全量引入约 260 KB（gzip 后约 88 KB），适合内部管理系统等场景。
          </KAlert>
          <div class="landing-field">
            <label>构建进度 68%</label>
            <KProgress :percentage="68" />
          </div>
          <div class="landing-field">
            <label>按钮组</label>
            <div class="landing-field__row">
              <KButton type="primary">主要按钮</KButton>
              <KButton>默认按钮</KButton>
              <KButton type="primary" plain>描边按钮</KButton>
            </div>
          </div>
          <div class="landing-field landing-field--last">
            <label>标签</label>
            <div class="landing-field__row">
              <KTag color="#ffffff" background-color="#1677ff">Vue 3</KTag>
              <KTag color="#ffffff" background-color="#0958d9">TypeScript</KTag>
              <KTag color="#1677ff" background-color="transparent" closable>Tree-shaking</KTag>
            </div>
          </div>
        </div>

        <div class="landing-panel">
          <div class="landing-panel__head">
            <span class="landing-panel__title">SupTable 超级表格</span>
            <KBadge count="HOT" />
          </div>
          <!-- 迷你表格演示：选中格 + 填充柄 + 列选中示意 -->
          <div class="sup-demo">
            <div class="sup-demo__bar">
              <span class="sup-demo__tool">+ 行</span>
              <span class="sup-demo__tool">+ 列</span>
              <span class="sup-demo__tool">删除</span>
            </div>
            <table class="sup-demo__table">
              <thead>
                <tr>
                  <th class="sup-demo__index"></th>
                  <th>成员</th>
                  <th class="sup-demo__col-on">角色</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="sup-demo__index">1</td>
                  <td>小琳</td>
                  <td class="sup-demo__cell-on">前端负责人<span class="sup-demo__handle"></span></td>
                  <td>在线</td>
                </tr>
                <tr>
                  <td class="sup-demo__index">2</td>
                  <td>阿岚</td>
                  <td>组件研发</td>
                  <td>忙碌</td>
                </tr>
                <tr>
                  <td class="sup-demo__index">3</td>
                  <td>小珂</td>
                  <td>文档维护</td>
                  <td>离线</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="landing-panel__chips">
            <span v-for="f in supFeatures" :key="f" class="landing-panel__chip">{{ f }}</span>
          </div>
        </div>
      </section>

      <!-- 核心特性 -->
      <section id="features" class="landing-section">
        <div class="landing-section__head" v-reveal>
          <h2 class="landing-section__title"><span class="bar">//</span> 为什么选择 KDesignUI</h2>
          <span class="landing-section__sub">为现代企业级中后台而生，每一处细节都经过打磨</span>
        </div>
        <div class="landing-features">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            v-reveal="i * 80"
            class="landing-features__item"
          >
            <span class="landing-features__icon">{{ f.icon }}</span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 组件总览 -->
      <section id="components" class="landing-section">
        <div class="landing-section__head" v-reveal>
          <h2 class="landing-section__title"><span class="bar">//</span> 组件总览</h2>
          <span class="landing-section__sub">点击任意组件查看文档与示例</span>
        </div>
        <div class="landing-quick">
          <RouterLink
            v-for="item in quickGroups.flatMap((g) => g.items)"
            :key="item.path"
            :to="item.path"
            v-reveal="0"
            class="landing-quick__card"
          >
            <div class="landing-quick__name">{{ item.name.split(' ')[0] }}</div>
            <div class="landing-quick__group">{{ item.name.split(' ')[1] || item.name }}</div>
          </RouterLink>
        </div>
      </section>

      <!-- 底部 CTA -->
      <section id="cta" class="landing-cta" v-reveal>
        <div class="landing-cta__glow" />
        <h2>三分钟接入你的项目</h2>
        <p>npm install @kindoo/kdesign —— 让 KDesignUI 为你的中后台提效</p>
        <div class="landing-cta__actions">
          <RouterLink to="/guide" class="landing-btn landing-btn--primary">查看安装指南</RouterLink>
          <RouterLink to="/components" class="landing-btn landing-btn--ghost">浏览组件</RouterLink>
        </div>
      </section>

      <footer class="landing-footer">
        <span>© 2026 KDesignUI · MIT License</span>
        <span>Vue 3 + TypeScript</span>
        <a class="landing-footer__gh" :href="REPO_URL" target="_blank" rel="noopener noreferrer">GitHub 仓库 ↗</a>
      </footer>
    </KScrollBar>
  </div>
</template>

<style scoped lang="scss">
.landing {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--lp-bg-page);
  transition: background 0.35s ease;
}

// ---- 全页滚动容器 ----
.landing-scroll {
  flex: 1;
  min-height: 0;

  :deep(.scrollbar__wrap) {
    height: 100%;
  }
}

// ---- 固定毛玻璃导航 ----
.landing-nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: var(--lp-nav-bg);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border-bottom: 1px solid var(--lp-border);

  &__brand {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 17px;
    font-weight: 700;
  }

  &__logo {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 14px rgba(22, 119, 255, 0.4);
  }

  &__links {
    display: flex;
    gap: 30px;

    a {
      font-size: 14px;
      color: var(--lp-text-2);
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: var(--lp-brand-light);
      }
    }
  }

  &__right {
  display: flex;
  gap: 10px;
  align-items: center;
}

&__gh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: var(--lp-text-1);
  cursor: pointer;
  border-radius: 999px;
  transition: color 0.25s ease, background 0.25s ease;

  &:hover {
    color: var(--lp-brand-light);
    background: var(--lp-card-bg);
  }
}

&__theme {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 6px 14px;
    font-size: 13px;
    color: var(--lp-text-1);
    cursor: pointer;
    background: var(--lp-card-bg);
    border: 1px solid var(--lp-border);
    border-radius: 999px;
    transition: border-color 0.25s ease, color 0.25s ease;

    &:hover {
      color: var(--lp-brand-light);
      border-color: var(--lp-brand);
    }
  }
}

// ---- Hero ----
.landing-hero {
  position: relative;
  padding: 150px 24px 60px;
  overflow: hidden;
  text-align: center;

  &__glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    pointer-events: none;

    &--a {
      top: -120px;
      left: 12%;
      width: 520px;
      height: 520px;
      background: rgba(22, 119, 255, 0.14);
    }

    &--b {
      top: 40px;
      right: 10%;
      width: 460px;
      height: 460px;
      background: rgba(0, 180, 255, 0.1);
    }
  }

  &__grid-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, rgba(22, 119, 255, 0.22) 1px, transparent 1px);
    background-size: 34px 34px;
    -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 75%);
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 75%);
  }

  &__badge {
    position: relative;
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 6px 16px;
    margin-bottom: 26px;
    font-size: 13px;
    color: var(--lp-brand-light);
    background: var(--lp-pill-bg);
    border: 1px solid rgba(22, 119, 255, 0.3);
    border-radius: 999px;
  }

  &__title {
    position: relative;
    margin-bottom: 22px;
    font-size: 72px;
    font-weight: 800;
    line-height: 1.14;
    letter-spacing: -1px;
    background: var(--lp-grad-text);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    // 第二行独立缩放：稍小一号保证单行放得下，与上句留出间距
    &-sub {
      display: block;
      padding-top: 14px;
      font-size: 0.82em;
      line-height: 1.1;
      white-space: nowrap;
    }
  }

  &__desc {
    position: relative;
    max-width: 600px;
    margin: 0 auto 34px;
    font-size: 15px;
    line-height: 1.9;
    color: var(--lp-text-2);
  }

  &__cta {
    position: relative;
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 52px;
  }

  &__stats {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    justify-content: center;
  }
}

.landing-stat-pill {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 10px 22px;
  background: var(--lp-glass-bg);
  border: 1px solid var(--lp-border);
  border-radius: 999px;
  backdrop-filter: blur(8px);

  b {
    font-size: 22px;
    background: var(--lp-grad-text);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  span {
    font-size: 13px;
    color: var(--lp-text-2);
  }
}

// ---- 通用按钮 ----
.landing-btn {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 13px 32px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  border-radius: 12px;
  transition: all 0.25s ease;

  &--primary {
    color: #fff;
    background: linear-gradient(120deg, #1677ff, #0a58e8);
    box-shadow: 0 8px 26px rgba(22, 119, 255, 0.45);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(22, 119, 255, 0.55);
    }
  }

  &--ghost {
    color: var(--lp-text-1);
    background: var(--lp-card-bg);
    border: 1px solid var(--lp-border);

    &:hover {
      color: var(--lp-brand-light);
      border-color: var(--lp-brand);
      transform: translateY(-2px);
    }
  }
}

// ---- 三栏玻璃面板舞台 ----
.landing-stage {
  position: relative;
  display: grid;
  grid-template-columns: 1.15fr 1fr 1.05fr;
  gap: 20px;
  align-items: stretch;
  max-width: 1080px;
  padding: 40px 24px 20px;
  margin: 0 auto;
}

.landing-panel {
  padding: 22px;
  background: var(--lp-glass-bg);
  border: 1px solid var(--lp-border);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.09);
  transition:
    border-color 0.3s ease,
    transform 0.3s ease;
  animation: panel-in 0.8s cubic-bezier(0.22, 0.8, 0.3, 1) both;

  &:hover {
    border-color: rgba(22, 119, 255, 0.55);
    transform: translateY(-3px);
  }

  &:nth-child(1) {
    animation-delay: 0.15s;
  }

  &:nth-child(2) {
    animation-delay: 0.35s;
  }

  &:nth-child(3) {
    animation-delay: 0.55s;
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
  }

  &__tag {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--lp-brand-light);
    background: var(--lp-pill-bg);
    border-radius: 999px;
  }

  &__alert {
    margin-bottom: 14px;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  &__chip {
    padding: 4px 10px;
    font-size: 12px;
    color: var(--lp-brand-light);
    background: var(--lp-pill-bg);
    border-radius: 999px;
  }
}

.landing-field {
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  &--last {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--lp-text-2);
  }

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    font-size: 13px;
  }

  &__switch-gap {
    margin-left: 8px;
  }

  &__hint {
    margin-top: 4px;
    font-size: 11px;
    color: var(--lp-text-2);
  }
}

// ---- SupTable 迷你表格演示 ----
.sup-demo {
  overflow: hidden;
  font-size: 12px;
  border: 1px solid var(--lp-border);
  border-radius: 10px;

  &__bar {
    display: flex;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid var(--lp-border);
  }

  &__tool {
    padding: 2px 8px;
    color: var(--lp-text-2);
    border: 1px solid var(--lp-border);
    border-radius: 6px;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 9px 10px;
      text-align: left;
      border-bottom: 1px solid var(--lp-border);
    }

    th {
      font-weight: 600;
      color: var(--lp-text-2);
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  &__index {
    width: 32px;
    color: var(--lp-text-2);
  }

  &__col-on {
    color: var(--lp-brand-light);
    background: rgba(22, 119, 255, 0.1);
  }

  &__cell-on {
    position: relative;
    background: rgba(22, 119, 255, 0.06);
    box-shadow: inset 0 0 0 2px var(--lp-brand);
  }

  &__handle {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 7px;
    height: 7px;
    background: var(--lp-brand);
    border: 1px solid #fff;
    border-radius: 1px;
  }
}

// ---- 通用区块（特性 / 组件总览） ----
.landing-section {
  max-width: 1080px;
  padding: 70px 24px 0;
  margin: 0 auto;
}

.landing-section__head {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 40px;
}

.landing-section__title {
  font-size: 30px;
  font-weight: 800;

  .bar {
    color: var(--lp-brand);
  }
}

.landing-section__sub {
  font-size: 15px;
  color: var(--lp-text-2);
}

// ---- 特性六卡 ----
.landing-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.landing-features__item {
  padding: 24px;
  background: var(--lp-card-bg);
  border: 1px solid var(--lp-border);
  border-radius: 14px;
  box-shadow: var(--lp-shadow-card);
  transition:
    border-color 0.3s ease,
    transform 0.3s ease;

  &:hover {
    border-color: rgba(22, 119, 255, 0.55);
    transform: translateY(-3px);
  }

  h3 {
    margin-bottom: 8px;
    font-size: 16px;
  }

  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.75;
    color: var(--lp-text-2);
  }
}

.landing-features__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 14px;
  font-size: 20px;
  background: var(--lp-pill-bg);
  border-radius: 12px;
}

// ---- 组件速览网格 ----
.landing-quick {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.landing-quick__card {
  padding: 18px 16px;
  text-align: left;
  text-decoration: none;
  background: var(--lp-card-bg);
  border: 1px solid var(--lp-border);
  border-radius: 14px;
  box-shadow: var(--lp-shadow-card);
  transition:
    border-color 0.25s ease,
    transform 0.25s ease;

  &:hover {
    border-color: rgba(22, 119, 255, 0.55);
    transform: translateY(-3px);
  }
}

.landing-quick__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--lp-text-1);
}

.landing-quick__group {
  margin-top: 3px;
  font-size: 11px;
  color: var(--lp-text-2);
}

// ---- 底部 CTA ----
.landing-cta {
  position: relative;
  max-width: 1080px;
  padding: 56px 24px;
  margin: 80px auto 0;
  overflow: hidden;
  text-align: center;
  background: var(--lp-glass-bg);
  border: 1px solid var(--lp-border);
  border-radius: 20px;
  backdrop-filter: blur(8px);

  &__glow {
    position: absolute;
    top: -160px;
    left: 50%;
    width: 420px;
    height: 420px;
    background: rgba(22, 119, 255, 0.16);
    filter: blur(80px);
    transform: translateX(-50%);
    pointer-events: none;
  }

  h2 {
    position: relative;
    margin-bottom: 12px;
    font-size: 30px;
    font-weight: 800;
  }

  p {
    position: relative;
    margin-bottom: 28px;
    font-size: 15px;
    color: var(--lp-text-2);
  }

  &__actions {
    position: relative;
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}

// ---- 页脚 ----
.landing-footer {
display: flex;
align-items: center;
justify-content: space-between;
max-width: 1080px;
padding: 28px 24px;
margin: 0 auto;
font-size: 13px;
color: var(--lp-text-2);
border-top: 1px solid var(--lp-border);

&__gh {
  color: var(--lp-text-2);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: var(--lp-brand-light);
  }
}
}

// ---- 面板入场动画 ----
@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(36px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ---- 尊重减弱动态偏好 ----
@media (prefers-reduced-motion: reduce) {
  .landing-panel {
    animation: none;
  }
}

// ---- 窄屏适配 ----
@media (max-width: 960px) {
  .landing-nav {
    padding: 0 16px;

    &__links {
      display: none;
    }
  }

  .landing-hero {
    padding-top: 110px;

    &__title {
      font-size: 44px;
    }
  }

  .landing-stage {
    grid-template-columns: 1fr;
  }

  .landing-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

<style lang="scss">
// 落地页专属主题变量（全局块：需要响应 html[data-theme] 切换，不能 scoped）
.landing {
  --lp-brand: #1677ff;
  --lp-brand-light: #69b1ff;
  --lp-text-1: #1d2129;
  --lp-text-2: #6e7079;
  --lp-border: #e5e6eb;
  --lp-card-bg: #ffffff;
  --lp-glass-bg: rgba(255, 255, 255, 0.62);
  --lp-nav-bg: rgba(255, 255, 255, 0.68);
  --lp-pill-bg: rgba(22, 119, 255, 0.08);
  --lp-grad-text: linear-gradient(115deg, #1677ff 0%, #00b4ff 48%, #00a98a 105%);
  --lp-bg-page: linear-gradient(180deg, #f7f7fc 0%, #eceef9 100%);
  --lp-shadow-card: 0 2px 10px rgba(29, 33, 41, 0.04);
}

html[data-theme='dark'] .landing {
  --lp-text-1: #f2f3f5;
  --lp-text-2: #a9aeb8;
  --lp-border: rgba(255, 255, 255, 0.09);
  --lp-card-bg: rgba(255, 255, 255, 0.045);
  --lp-glass-bg: rgba(255, 255, 255, 0.06);
  --lp-nav-bg: rgba(13, 13, 30, 0.35);
  --lp-pill-bg: rgba(22, 119, 255, 0.12);
  --lp-grad-text: linear-gradient(115deg, #9ecbff 0%, #69b1ff 40%, #5fe3bd 105%);
  --lp-bg-page: linear-gradient(180deg, #0d0d1e 0%, #14142e 100%);
  --lp-shadow-card: 0 2px 10px rgba(0, 0, 0, 0.25);
}

// v-reveal 滚动入场动画（全局类：由 src/directives/reveal.ts 指令动态添加，不能 scoped）
// 初始仅隐藏 opacity；transform 交给 @keyframes，避免覆盖卡片自身的 hover 位移过渡
.reveal {
  opacity: 0;

  &.is-revealed {
    opacity: 1;
    animation: reveal-in 0.7s ease both;
  }
}

@keyframes reveal-in {
  from {
    opacity: 0;
    transform: translateY(28px);
  }

  to {
    opacity: 1;
  }
}

// 尊重系统"减弱动态效果"偏好：直接显示，不播动画
@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    animation: none;
  }
}
</style>
