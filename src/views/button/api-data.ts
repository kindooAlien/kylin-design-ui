/** 该文件由 scripts/gen-api.mjs 自动生成，请勿手改。重新生成：node scripts/gen-api.mjs /Users/macair123/Desktop/vue3-ts-app/src/components/button/index.tsx */

import type { ApiPropRow, ApiEventRow, ApiSlotRow } from '@/components/api-table/types'

export type { ApiPropRow, ApiEventRow, ApiSlotRow }

export const apiProps: ApiPropRow[] = [
  { name: 'type', type: "'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'", default: "'default'", required: false, desc: "按钮颜色变体（default / primary / success / info / warning / error）。" },
  { name: 'size', type: "'large' | 'middle' | 'small' | 'mini'", default: "'middle'", required: false, desc: "按钮尺寸预设（large / middle / small / mini）。" },
  { name: 'plain', type: "Boolean", default: "false", required: false, desc: "浅底深字（浅色背景 + 对应颜色的深色文字）。" },
  { name: 'round', type: "Boolean", default: "false", required: false, desc: "圆角按钮（四个角较大圆角）。" },
  { name: 'circle', type: "Boolean", default: "false", required: false, desc: "圆形图标按钮（仅图标，不渲染文字插槽）。" },
  { name: 'square', type: "Boolean", default: "false", required: false, desc: "纯正方形按钮：精简样式（无内边距/间距），默认边长 20px，可用 width/height 自定义。" },
  { name: 'width', type: "number | string", default: "20（方形）", required: false, desc: "方形按钮宽度（数字按 px 或任意 CSS 值）；方形下缺省 20px。" },
  { name: 'height', type: "number | string", default: "同 width", required: false, desc: "方形按钮高度；缺省与 width 相同（保持正方形）。" },
  { name: 'text', type: "Boolean", default: "false", required: false, desc: "文字按钮：透明背景，hover 浅色背景。" },
  { name: 'link', type: "Boolean", default: "false", required: false, desc: "链接按钮：透明背景，hover 下划线。" },
  { name: 'disabled', type: "Boolean", default: "false", required: false, desc: "禁用状态——按 type 使用冲淡的浅色。" },
  { name: 'loading', type: "Boolean", default: "false", required: false, desc: "加载中状态——显示 spinner，光标显示进度。" },
  { name: 'dark', type: "Boolean", default: "false", required: false, desc: "深色禁用变体（灰色代替冲淡的 type 色）。" },
  { name: 'nativeType', type: "'button' | 'submit' | 'reset'", default: "'button'", required: false, desc: "`<button>` 元素的原生 type 属性（button / submit / reset）。" },
  { name: 'icon', type: "String", default: "undefined", required: false, desc: "Icon 图标（iconfont 名称），通过 <KIcon> 渲染在文字之前。" },
  { name: 'href', type: "String", default: "undefined", required: false, desc: "跳转链接：传入后渲染为 <a> 锚元素而非 <button>，可与 link/text/plain 等样式组合。" },
  { name: 'target', type: "String", default: "undefined", required: false, desc: "仅 href 模式生效，透传 <a> 的 target（如 _blank）。为 _blank 且未显式设置 rel 时自动补 noopener noreferrer。" },
  { name: 'rel', type: "String", default: "undefined（自动推断）", required: false, desc: "仅 href 模式生效，透传 <a> 的 rel；显式设置时覆盖自动推断值。" },
]

export const apiEmits: ApiEventRow[] = [
  { name: 'click', desc: '' },
]

export const apiSlots: ApiSlotRow[] = [
  { name: 'icon', desc: '' },
  { name: 'default', desc: '' },
]
