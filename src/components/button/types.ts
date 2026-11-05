/** 按钮颜色变体：default 白底 / primary / success / info / warning / error。 */
export type ButtonType = 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'

/** 按钮尺寸预设：large / middle / small / mini。 */
export type ButtonSize = 'large' | 'middle' | 'small' | 'mini'

/** 原生 `<button>` 的 type 属性：button / submit / reset。 */
export type ButtonNativeType = 'button' | 'submit' | 'reset'

export interface ButtonProps {
  /** 按钮颜色变体（default / primary / success / info / warning / error）。 */
  type?: ButtonType
  /** 按钮尺寸预设（large / middle / small / mini）。 */
  size?: ButtonSize
  /** 浅底深字（浅色背景 + 对应颜色的深色文字）。 */
  plain?: boolean
  /** 圆角按钮（四个角较大圆角）。 */
  round?: boolean
  /** 圆形图标按钮（仅图标，不渲染文字插槽）。 */
  circle?: boolean
  /** 纯正方形按钮：精简样式，默认边长 20px，可用 width/height 单独设置 */
  square?: boolean
  /** 方形按钮的自定义宽度（px 数字或 CSS 值），缺省 20px */
  width?: number | string
  /** 方形按钮的自定义高度（px 数字或 CSS 值），缺省与 width 相同 */
  height?: number | string
  /** 文字按钮：透明背景，hover 浅色背景。 */
  text?: boolean
  /** 链接按钮：透明背景，hover 下划线。 */
  link?: boolean
  /** 禁用状态——按 type 使用冲淡的浅色。 */
  disabled?: boolean
  /** 加载中状态——显示 spinner，光标显示进度。 */
  loading?: boolean
  /** 深色禁用变体（灰色代替冲淡的 type 色）。 */
  dark?: boolean
  /** 传入后渲染为 `<a>` 链接元素而非 `<button>`（href 原样透传）。 */
  href?: string
  /** 链接按钮的 target（仅 href 存在时生效），如 _blank。 */
  target?: string
  /** 链接按钮的 rel；缺省时 target=_blank 自动补 noopener noreferrer。 */
  rel?: string
  /** `<button>` 元素的原生 type 属性（button / submit / reset）。 */
  nativeType?: ButtonNativeType
}
