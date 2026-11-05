import { defineComponent, type PropType, computed, Comment, type VNode } from 'vue'
import { createBem } from '@/utils/create-bem'
import KIcon from '@/components/icon/index'
import { useButtonClasses } from './composables/useButtonClasses'
import type { ButtonType, ButtonSize, ButtonNativeType } from './types'
import './index.scss'

const [, e] = createBem('k-btn')

export default defineComponent({
  name: 'KButton',
  props: {
    type: { type: String as PropType<ButtonType>, default: 'default' },
    size: { type: String as PropType<ButtonSize>, default: 'middle' },
    plain: { type: Boolean, default: false },
    round: { type: Boolean, default: false },
    circle: { type: Boolean, default: false },
    /** 纯正方形按钮：精简样式，默认边长 20px，可用 width/height 单独设置 */
    square: { type: Boolean, default: false },
    /** 方形按钮宽度（px 数字或 CSS 值），缺省 20px */
    width: { type: [Number, String] as PropType<number | string>, default: undefined },
    /** 方形按钮高度（px 数字或 CSS 值），缺省与 width 相同（保持正方形） */
    height: { type: [Number, String] as PropType<number | string>, default: undefined },
    text: { type: Boolean, default: false },
    link: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    dark: { type: Boolean, default: false },
    nativeType: { type: String as PropType<ButtonNativeType>, default: 'button' },
    /** Icon 图标（iconfont 名称），通过 <KIcon> 渲染在文字之前。 */
    icon: { type: String, default: undefined },
    /** 传入后渲染为 `<a>` 链接元素而非 `<button>`（href 原样透传）。 */
    href: { type: String, default: undefined },
    /** 链接按钮的 target（仅 href 存在时生效），如 _blank。 */
    target: { type: String, default: undefined },
    /** 链接按钮的 rel；缺省时 target=_blank 自动补 noopener noreferrer。 */
    rel: { type: String, default: undefined },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const classes = useButtonClasses(props)

    // Computed interactive state: effectively disabled when either disabled or loading.
    const isInteractiveDisabled = computed(() => props.disabled || props.loading)

    // 判定默认插槽是否包含有效文本内容。
    // 纯空白（模板换行/空格）或注释节点（v-if 为 false 的占位）不算有效内容：
    // 否则「图标 + 仅空白的文字 span」之间仍会被基础样式的 gap:8px 撑出幽灵间距。
    const hasMeaningfulText = computed<boolean>(() => {
      const nodes = slots.default?.()
      if (!nodes) return false
      const check = (n: VNode | string | number | unknown): boolean => {
        if (typeof n === 'string' || typeof n === 'number') return String(n).trim() !== ''
        if (Array.isArray(n)) return n.some((c) => check(c))
        if (n && typeof n === 'object' && 'type' in (n as VNode)) {
          const vn = n as VNode
          if (vn.type === Comment) return false
          return true
        }
        return true
      }
      return nodes.some((n) => check(n))
    })

    // 方形按钮尺寸：默认 20px，width/height 可单独设置（缺省保持正方形）
    const squareStyle = computed<Record<string, string> | undefined>(() => {
      if (!props.square) return undefined
      const toVal = (v: number | string | undefined): string => {
        if (v == null) return ''
        if (typeof v === 'number') return `${v}px`
        const s = String(v).trim()
        // 纯数字字符串补 px；含单位的字符串（如 '2.5rem'）原样
        return /^\d+(\.\d+)?$/.test(s) ? `${s}px` : s
      }
      const w = props.width ?? 20
      const h = props.height ?? props.width ?? 20
      return {
        width: toVal(w),
        height: toVal(h),
      }
    })

    // 链接模式：传入 href 时渲染为 <a>，保留完整链接语义（中键/右键新开、复制地址、SEO）。
    // 禁用/加载中的链接按钮不可点击：aria-disabled 标记 + 阻止默认导航。
    const isLink = computed(() => !!props.href)
    const anchorRel = computed(() => {
      if (props.rel) return props.rel
      return props.target === '_blank' ? 'noopener noreferrer' : undefined
    })

    function handleAnchorClick(e: MouseEvent) {
      if (isInteractiveDisabled.value) {
        e.preventDefault()
        return
      }
      emit('click', e)
    }

    return () => {
      const Tag = (isLink.value ? 'a' : 'button') as 'a' | 'button'
      return (
        <Tag
          class={classes.value}
          style={squareStyle.value}
          {...(isLink.value
            ? {
                href: props.href,
                target: props.target,
                rel: anchorRel.value,
                'aria-disabled': isInteractiveDisabled.value || undefined,
                onClick: handleAnchorClick,
              }
            : {
                type: props.nativeType,
                disabled: isInteractiveDisabled.value,
                'aria-disabled': isInteractiveDisabled.value,
                'aria-busy': props.loading,
                onClick: (e: MouseEvent) => !isInteractiveDisabled.value && emit('click', e),
              })}
        >
          {props.loading && <span class={e('loading')} />}
          {slots.icon ? slots.icon() : props.icon ? <KIcon name={props.icon} /> : undefined}
          {/* 无有效默认内容时不渲染文字 span：否则基础样式的 gap:8px 会在纯图标按钮
              的图标右侧凭空多出 8px 间距，导致图标无法正对居中。
              hasMeaningfulText 同时拦截「未传插槽」与「插槽只有空白/注释节点」两种形态。 */}
          {!props.circle && hasMeaningfulText.value && (
            <span class={e('text')}>{slots.default?.()}</span>
          )}
        </Tag>
      )
    }
  },
})
