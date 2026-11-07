import { defineComponent, ref, computed, watch, onMounted, nextTick, provide, inject, type PropType, type CSSProperties } from 'vue'
import { createBem } from '@/utils/create-bem'
import KIcon from '@/components/icon/index'
import KTooltip from '@/components/tooltip/index'
import KScroll from '@/components/scrollbar/index'
import './index.scss'

const [b, e, m, v] = createBem('k-avatar')

export type AvatarShape = 'circle' | 'square'
export type AvatarSize = number | 'small' | 'default' | 'large'

/** 预设尺寸 → 容器边长 / 字号 / 图标字号（对齐 antd token：32/40/24） */
const SIZE_MAP: Record<string, { box: number; font: number; icon: number }> = {
  small: { box: 24, font: 12, icon: 14 },
  default: { box: 32, font: 14, icon: 18 },
  large: { box: 40, font: 16, icon: 24 },
}

/** Group 下发上下文：子 Avatar 未显式设置 size / shape 时继承 */
const AVATAR_GROUP_CTX = Symbol('k-avatar-group')

interface GroupContext {
  size?: AvatarSize
  shape?: AvatarShape
}

/**
 * KAvatar — 头像，用来代表用户或事物。
 *
 * 三种内容形态，优先级：图片 > 图标 > 字符（默认插槽）：
 *  - 图片：`src`（支持 srcSet）；加载失败时依次回退到 icon、插槽字符、
 *    默认用户图标；onError 回调返回 false 可关闭内置回退，完全自行处理；
 *  - 图标：`icon` 传 iconfont 名称（如 'user-filling'）；
 *  - 字符：默认插槽文本，超出宽度时按容器宽度自动缩放字号，
 *    `gap` 控制字符距左右边界的像素。
 *
 * 尺寸：`size` 支持 small / default / large 预设或数字（px）；
 * 形状：`shape` circle（默认）/ square；
 * 颜色：`backgroundColor` / `color` 快捷自定义（icon / 字符型）。
 *
 * 组合展示用 `<AvatarGroup>`（同目录导出），支持 maxCount 溢出折叠。
 */
const KAvatar = defineComponent({
  name: 'KAvatar',
  props: {
    /** 图片类头像的资源地址 */
    src: { type: String, default: undefined },
    /** 图片响应式资源地址（原生 srcset） */
    srcSet: { type: String, default: undefined },
    /** 图片加载失败时的替代文本 */
    alt: { type: String, default: undefined },
    /** 自定义图标（iconfont 名称），也是图片加载失败的第一回退 */
    icon: { type: String, default: undefined },
    /** 指定头像形状：circle 圆形（默认）/ square 方形 */
    shape: { type: String as PropType<AvatarShape>, default: undefined },
    /** 头像大小：small / default / large 预设或数字（px） */
    size: { type: [Number, String] as PropType<AvatarSize>, default: undefined },
    /** 字符型头像中字符距左右边界的像素 */
    gap: { type: Number, default: 4 },
    /** 图片是否允许拖动 */
    draggable: { type: Boolean, default: true },
    /** 图片 CORS 属性：anonymous / use-credentials */
    crossOrigin: { type: String as PropType<'anonymous' | 'use-credentials' | undefined>, default: undefined },
    /** 背景色（icon / 字符型使用） */
    backgroundColor: { type: String, default: undefined },
    /** 文字/图标颜色 */
    color: { type: String, default: undefined },
    /**
     * 图片加载失败回调（同时触发 error 事件）；
     * 返回 false 时关闭组件内置回退（不再自动切到 icon / 字符 / 默认图标）
     */
    onError: { type: Function as PropType<() => boolean>, default: undefined },
  },
  emits: ['error'],
  setup(props, { slots, emit }) {
    const groupCtx = inject<GroupContext | null>(AVATAR_GROUP_CTX, null)

    /** 图片是否处于加载失败状态（src 变化时重试） */
    const imgFailed = ref(false)
    watch(() => props.src, () => { imgFailed.value = false })

    /* ===================== 尺寸 ===================== */

    const resolvedSize = computed<AvatarSize>(() => props.size ?? groupCtx?.size ?? 'default')
    const isPreset = computed(() => typeof resolvedSize.value === 'string')
    const boxSize = computed(() => {
      if (typeof resolvedSize.value === 'number') return resolvedSize.value
      return SIZE_MAP[resolvedSize.value]?.box ?? 32
    })
    /** 数字尺寸相对 default(32px) 的缩放比，用于派生字号/图标字号 */
    const fontScale = computed(() => {
      if (typeof resolvedSize.value === 'number') return resolvedSize.value / 32
      return 1
    })

    /* ===================== 内容形态判定 ===================== */

    const slotText = computed(() => {
      const nodes = slots.default?.()
      if (!nodes) return ''
      const text = nodes
        .map((n) => (typeof n.children === 'string' ? n.children : ''))
        .join('')
        .trim()
      return text
    })

    const isImg = computed(() => Boolean(props.src) && !imgFailed.value)
    const isIcon = computed(() => !isImg.value && Boolean(props.icon))
    const isText = computed(() => !isImg.value && !props.icon && Boolean(slotText.value))

    /* ===================== 字符自动缩放 ===================== */

    const textRef = ref<HTMLElement>()
    const textScale = ref(1)

    const measureText = () => {
      const el = textRef.value
      if (!el || !isText.value) return
      // 字符宽度超过可用宽度（容器 - 左右 gap）时按比例缩小
      const available = boxSize.value - props.gap * 2
      const textWidth = el.scrollWidth
      if (textWidth > available && available > 0) {
        textScale.value = Math.max(available / textWidth, 0.25)
      } else {
        textScale.value = 1
      }
    }

    watch([slotText, boxSize, () => props.gap], () => nextTick(measureText))
    onMounted(measureText)

    /* ===================== 事件 ===================== */

    const handleImgError = (ev: Event) => {
      imgFailed.value = true
      emit('error', ev)
      // antd 语义：onError 返回 false 关闭内置回退
      if (props.onError?.() === false) return
    }

    /* ===================== 类名与样式 ===================== */

    const classes = computed(() => [
      b(),
      v('square', props.shape === 'square' || (props.shape === undefined && groupCtx?.shape === 'square')),
      v('small', resolvedSize.value === 'small'),
      v('large', resolvedSize.value === 'large'),
    ])

    const rootStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = {}
      if (typeof resolvedSize.value === 'number') {
        style.width = `${resolvedSize.value}px`
        style.height = `${resolvedSize.value}px`
      }
      if (props.backgroundColor) style.backgroundColor = props.backgroundColor
      if (props.color) style.color = props.color
      return style
    })

    const renderContent = () => {
      if (isImg.value) {
        return (
          <img
            src={props.src}
            srcSet={props.srcSet}
            alt={props.alt}
            draggable={props.draggable}
            crossOrigin={props.crossOrigin}
            onError={handleImgError}
          />
        )
      }
      if (props.icon) {
        return <KIcon name={props.icon} style={{ fontSize: `${SIZE_MAP.default.icon * fontScale.value}px` }} />
      }
      if (slotText.value) {
        return (
          <span
            ref={textRef}
            class={e('text')}
            style={{
              fontSize: `${SIZE_MAP.default.font * fontScale.value}px`,
              padding: `0 ${props.gap}px`,
              transform: textScale.value === 1 ? undefined : `scale(${textScale.value})`,
            }}
          >
            {slotText.value}
          </span>
        )
      }
      // 图片失败且无 icon、无字符时，兜底默认用户图标
      return <KIcon name="user" style={{ fontSize: `${SIZE_MAP.default.icon * fontScale.value}px` }} />
    }

    return () => (
      <span class={classes.value} style={rootStyle.value}>
        {renderContent()}
      </span>
    )
  },
})

/**
 * AvatarGroup — 头像组合展示。
 *
 * 默认重叠排布（白色描边分隔，square 形状用圆角描边）；
 * `maxCount` 超出时末位显示 "+N"，hover 弹出气泡列出溢出成员，
 * `maxPopoverPlacement` 控制气泡方向（top / bottom），
 * `maxStyle` 自定义 "+N" 溢出块样式。
 * `size` / `shape` 未显式设置的子 Avatar 会继承 Group 的设置。
 */
const AvatarGroup = defineComponent({
  name: 'KAvatarGroup',
  props: {
    /** 最多显示的头像数量，超出折叠为 "+N" 气泡；不传则全部重叠展示 */
    maxCount: { type: Number, default: undefined },
    /** "+N" 溢出块的自定义样式（如背景色、文字色） */
    maxStyle: { type: Object as PropType<CSSProperties>, default: undefined },
    /** 溢出气泡弹出方向：top（默认）/ bottom */
    maxPopoverPlacement: { type: String as PropType<'top' | 'bottom'>, default: 'top' },
    /** 组内头像大小，子 Avatar 未显式设置时继承 */
    size: { type: [Number, String] as PropType<AvatarSize>, default: undefined },
    /** 组内头像形状，子 Avatar 未显式设置时继承 */
    shape: { type: String as PropType<AvatarShape>, default: undefined },
  },
  setup(props, { slots }) {
    provide(AVATAR_GROUP_CTX, {
      size: props.size,
      shape: props.shape,
    })

    /** 读取 Avatar vnode 的默认插槽字符（用于气泡中的成员名展示，无字符则返回空） */
    const readSlotText = (n: any) => {
      const children = n?.children?.default
      if (typeof children !== 'function') return ''
      return (children() || [])
        .map((c: any) => (typeof c?.children === 'string' ? c.children : ''))
        .join('')
        .trim()
    }

    /** 扁平化插槽节点：v-for 会编译为 Fragment，需展开后才能逐个计数/折叠 */
    const flattenNodes = (nodes: any[]): any[] =>
      nodes.flatMap((n) => (Array.isArray(n.children) ? flattenNodes(n.children as any[]) : [n]))

    return () => {
      // 在 render 中切分，保证 slots 动态变化时折叠数与气泡内容保持响应
      const children = flattenNodes(slots.default?.() ?? []).filter((n) => n.type !== Comment)
      const overflow =
        props.maxCount !== undefined && children.length > props.maxCount
          ? children.slice(props.maxCount)
          : []
      const visibleItems = overflow.length > 0 ? children.slice(0, props.maxCount) : children
      const overflowNames = overflow.map(readSlotText)

      const showOverflow = overflow.length > 0
      return (
        <div class={e('group')}>
          {visibleItems}
          {showOverflow && (
            <KTooltip placement={props.maxPopoverPlacement} trigger="hover">
              {{
                content: () => (
                  <div class={e('group-overflow')}>
                    <KScroll max-height="240px">
                      {overflow.map((n, i) => (
                        <div key={i} class={e('group-overflow-item')}>
                          {n}
                          {overflowNames[i] ? (
                            <span class={e('group-overflow-name')}>{overflowNames[i]}</span>
                          ) : null}
                        </div>
                      ))}
                    </KScroll>
                  </div>
                ),
                default: () => (
                  <span class={[b(), v('square', props.shape === 'square'), e('more')]} style={props.maxStyle}>
                    +{overflow.length}
                  </span>
                ),
              }}
            </KTooltip>
          )}
        </div>
      )
    }
  },
})

export { KAvatar, AvatarGroup }
export default KAvatar
