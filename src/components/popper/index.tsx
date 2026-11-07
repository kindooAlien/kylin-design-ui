/**
 * KPopper — 基础弹出面板组件
 *
 * 职责：
 *  - 根据 triggerRef 定位弹出面板（12 方向 + 自动翻转）
 *  - Teleport 到 body
 *  - click outside 关闭
 *  - 视口边界保护
 *  - 箭头偏移计算
 *  - 窗口 resize / scroll 时重新定位
 *
 * 不负责：
 *  - 触发方式（hover / click / manual）—— 由使用者控制 visible
 *  - 面板样式（背景、圆角、阴影、箭头颜色）—— 由使用者通过面板插槽自定义
 *  - 动画 —— 由使用者用 Transition 包裹
 */
import {
  defineComponent,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  Teleport,
  Transition,
  type Ref,
  type PropType,
} from "vue";
import { createBem } from "@/utils/create-bem";
import "./index.scss";

const [b, e] = createBem("k-popper");

export type PopperPlacement =
  | "top" | "top-start" | "top-end"
  | "bottom" | "bottom-start" | "bottom-end"
  | "left" | "left-start" | "left-end"
  | "right" | "right-start" | "right-end";

export default defineComponent({
  name: "KPopper",
  props: {
    /** 是否可见 */
    visible: { type: Boolean, default: false },
    /** 定位方向 */
    placement: { type: String as PropType<PopperPlacement>, default: "bottom" },
    /** 触发元素（用于定位）。支持传入 HTMLElement、null 或 Ref<HTMLElement | null> */
    triggerRef: { type: Object as PropType<HTMLElement | null | undefined | Ref<HTMLElement | null | undefined>>, default: null },
    /** 触发元素的 DOMRect（用于 manual 模式，优先级高于 triggerRef） */
    anchorRect: { type: Object as PropType<DOMRect | null>, default: null },
    /** 是否 Teleport 到 body */
    teleported: { type: Boolean, default: true },
    /** 与 trigger 的间距 */
    gap: { type: Number, default: 8 },
    /** 视口边距 */
    margin: { type: Number, default: 8 },
    /** 是否展示箭头 */
    arrow: { type: Boolean, default: false },
    /** 箭头尺寸（px） */
    arrowSize: { type: Number, default: 10 },
    /** 是否启用自动翻转 */
    autoFlip: { type: Boolean, default: true },
    /** 面板最大宽度 */
    maxWidth: { type: [String, Number], default: undefined },
    /** 面板最小宽度（常用于 dropdown 与 trigger 等宽） */
    minWidth: { type: [String, Number], default: undefined },
    /** 面板宽度（常用于 dropdown 与 trigger 等宽） */
    width: { type: [String, Number], default: undefined },
    /** z-index */
    zIndex: { type: Number, default: 2100 },
    /** 自定义类 */
    popperClass: { type: String, default: undefined },
    /** 点击外部是否关闭 */
    closeOnClickOutside: { type: Boolean, default: true },
    /** 是否捕获 scroll 事件重新定位（开销较大，默认关闭） */
    scrollFollow: { type: Boolean, default: false },
    /** 动画类型：'zoom-fade' 缩放淡入 | 'slide-fade' 滑动淡入 | 'none' 无动画 */
    transition: { type: String as PropType<'zoom-fade' | 'slide-fade' | 'none'>, default: 'zoom-fade' },
    /** 动画持续时间（ms） */
    transitionDuration: { type: Number, default: 200 },
  },
  emits: ["update:visible", "click-outside"],

  setup(props, { emit, slots }) {
    const panelRef = ref<HTMLElement | null>(null);
    const position = ref({ top: 0, left: 0 });
    const positioned = ref(false);
    const effectivePlacement = ref<PopperPlacement>(props.placement);
    const arrowOffsetX = ref(0);
    const arrowOffsetY = ref(0);

    /** 解析 triggerRef，支持 Ref 对象或直接值 */
    const resolveTrigger = (): HTMLElement | null => {
      const t = props.triggerRef;
      if (!t) return null;
      // 检查是否是 Ref 对象（有 value 属性且是 HTMLElement 或 null）
      if ((t as Ref<HTMLElement | null>).value !== undefined) {
        return (t as Ref<HTMLElement | null>).value;
      }
      return t as HTMLElement | null;
    };

    /* ===================== 定位计算 ===================== */

    const calcPosition = () => {
      const panel = panelRef.value;
      if (!panel) return;

      // 获取 trigger 的 rect
      let rect: DOMRect | undefined;
      if (props.anchorRect) {
        rect = props.anchorRect;
      } else {
        const triggerEl = resolveTrigger();
        if (triggerEl) {
          rect = triggerEl.getBoundingClientRect();
        }
      }
      if (!rect) return;

      const pw = panel.offsetWidth;
      const ph = panel.offsetHeight;
      const gap = props.gap;
      const margin = props.margin;
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;

      let placement = props.placement as string;

      // 自动翻转
      if (props.autoFlip) {
        const space = {
          top: rect.top,
          bottom: vh - rect.bottom,
          left: rect.left,
          right: vw - rect.right,
        };

        const need = ph + gap + margin;

        // 双向决策：如果当前方向空间不足且对侧空间更大，则翻转
        const pickDirection = (a: string, b: string) => {
          if (!placement.startsWith(a) && !placement.startsWith(b)) return;
          const spaceA = space[a as keyof typeof space];
          const spaceB = space[b as keyof typeof space];
          // 如果当前方向空间不足，且对侧空间更大（或至少够用），换到对侧
          const current = placement.startsWith(a) ? a : b;
          const opposite = current === a ? b : a;
          const currentSpace = current === a ? spaceA : spaceB;
          const oppSpace = current === a ? spaceB : spaceA;
          if (currentSpace < need && oppSpace >= need) {
            placement = placement.replace(current, opposite);
          } else if (currentSpace < need && oppSpace > currentSpace) {
            // 当前方向不够，对侧也不够但比当前大 → 换到对侧（空间更大的一侧）
            placement = placement.replace(current, opposite);
          }
          // 两侧都够用时保持当前方向，不做无谓翻转
        };

        pickDirection("bottom", "top");
        pickDirection("left", "right");
      }

      let top = 0;
      let left = 0;

      // 12 方向定位
      if (placement === "top") {
        top = rect.top - ph - gap;
        left = rect.left + rect.width / 2 - pw / 2;
      } else if (placement === "top-start") {
        top = rect.top - ph - gap;
        left = rect.left;
      } else if (placement === "top-end") {
        top = rect.top - ph - gap;
        left = rect.right - pw;
      } else if (placement === "bottom") {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - pw / 2;
      } else if (placement === "bottom-start") {
        top = rect.bottom + gap;
        left = rect.left;
      } else if (placement === "bottom-end") {
        top = rect.bottom + gap;
        left = rect.right - pw;
      } else if (placement === "left") {
        top = rect.top + rect.height / 2 - ph / 2;
        left = rect.left - pw - gap;
      } else if (placement === "left-start") {
        top = rect.top;
        left = rect.left - pw - gap;
      } else if (placement === "left-end") {
        top = rect.bottom - ph;
        left = rect.left - pw - gap;
      } else if (placement === "right") {
        top = rect.top + rect.height / 2 - ph / 2;
        left = rect.right + gap;
      } else if (placement === "right-start") {
        top = rect.top;
        left = rect.right + gap;
      } else if (placement === "right-end") {
        top = rect.bottom - ph;
        left = rect.right + gap;
      }

      // 边界保护
      if (left < margin) left = margin;
      else if (left + pw > vw - margin) left = vw - margin - pw;

      if (placement.includes("top") || placement.includes("bottom")) {
        // 水平方向边界保护
      } else {
        if (top < margin) top = margin;
        else if (top + ph > vh - margin) top = vh - margin - ph;
      }

      // 箭头偏移
      let ax = 0;
      let ay = 0;
      if (props.arrow) {
        if (placement.includes("top") || placement.includes("bottom")) {
          ax = rect.left + rect.width / 2 - (left + pw / 2);
          ax = Math.max(-pw / 2 + props.arrowSize, Math.min(pw / 2 - props.arrowSize, ax));
        } else {
          const targetCenterY = rect.top + rect.height / 2;
          const tooltipCenterY = top + ph / 2;
          ay = targetCenterY - tooltipCenterY;
          const maxOffset = Math.max(props.arrowSize, ph / 2 - 8);
          ay = Math.max(-maxOffset, Math.min(maxOffset, ay));
        }
      }

      arrowOffsetX.value = ax;
      arrowOffsetY.value = ay;
      effectivePlacement.value = placement as PopperPlacement;
      position.value = { top, left };
      positioned.value = true;
    };

    /* ===================== 重定位触发 ===================== */

    // visible 变化时定位
    watch(() => props.visible, (v) => {
      if (v) {
        positioned.value = false;
        nextTick(calcPosition);
      } else {
        positioned.value = false;
      }
    });

    // anchorRect 变化时重新定位
    watch(() => props.anchorRect, () => {
      if (props.visible) nextTick(calcPosition);
    }, { deep: true });

    let observer: MutationObserver | null = null;

    // 首次挂载时如果 visible 为 true，也需要定位
    onMounted(() => {
      if (props.visible) {
        requestAnimationFrame(() => {
          nextTick(calcPosition);
        });
      }

      // 捕获阶段监听：Dialog/Drawer 面板会在冒泡阶段 stopPropagation（防误触遮罩），
      // 若在冒泡阶段监听会收不到弹层容器内部的 pointerdown，
      // 导致弹层内点击空白时 select/date-picker 等下拉不关闭；捕获阶段不受拦截
      document.addEventListener("pointerdown", handlePointerDown, true);
      window.addEventListener("resize", handleViewportChange);
      if (props.scrollFollow) {
        document.addEventListener("scroll", handleViewportChange, { capture: true, passive: true });
      }

      // MutationObserver 监听面板内容变化，自动重新定位
      observer = new MutationObserver(() => {
        if (props.visible) {
          nextTick(calcPosition);
        }
      });
    });

    onBeforeUnmount(() => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("resize", handleViewportChange);
      if (props.scrollFollow) {
        document.removeEventListener("scroll", handleViewportChange, { capture: true });
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    });

    /* ===================== click outside ===================== */

    const handlePointerDown = (e: PointerEvent) => {
      if (!props.visible || !props.closeOnClickOutside) return;
      const target = e.target as Node;
      const panel = panelRef.value;
      if (panel && panel.contains(target)) return;
      const triggerEl = resolveTrigger();
      if (triggerEl && triggerEl.contains(target)) return;
      emit("click-outside");
      emit("update:visible", false);
    };

    /* ===================== resize / scroll ===================== */

    const handleViewportChange = () => {
      if (props.visible) calcPosition();
    };

    /* ===================== 面板样式 ===================== */

    const panelStyle = computed(() => {
      const style: Record<string, any> = {
        top: `${position.value.top}px`,
        left: `${position.value.left}px`,
      };
      if (props.maxWidth != null) {
        style.maxWidth = typeof props.maxWidth === "number" ? `${props.maxWidth}px` : props.maxWidth;
      }
      if (props.minWidth != null) {
        style.minWidth = typeof props.minWidth === "number" ? `${props.minWidth}px` : props.minWidth;
      }
      if (props.width != null) {
        style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
      }
      if (props.zIndex != null) {
        style.zIndex = props.zIndex;
      }
      if (!positioned.value) {
        style.visibility = "hidden";
      }
      return style;
    });

    const arrowStyle = computed(() => ({
      "--popper-arrow-offset-x": `${arrowOffsetX.value}px`,
      "--popper-arrow-offset-y": `${arrowOffsetY.value}px`,
      "--popper-arrow-size": `${props.arrowSize}px`,
    } as Record<string, string>));

    /* ===================== 动画 ===================== */

    const transitionName = computed(() => {
      if (props.transition === 'none') return '';
      return `k-popper-${props.transition}`;
    });

    // 根据 placement 动态设置 transform-origin
    const originStyle = computed(() => {
      if (props.transition === 'none') return undefined;
      const p = effectivePlacement.value;
      let origin = '';
      if (p.startsWith('bottom')) origin = 'top center';
      else if (p.startsWith('top')) origin = 'bottom center';
      else if (p.startsWith('left')) origin = 'right center';
      else if (p.startsWith('right')) origin = 'left center';
      return origin ? { '--popper-origin': origin } as Record<string, string> : undefined;
    });

    /* ===================== 渲染 ===================== */

    return () => {
      const transName = transitionName.value;

      const panel = (
        <div
          ref={panelRef}
          class={[
            b(),
            e(`--${effectivePlacement.value}`),
            props.popperClass,
            transName && `${transName}-panel`,
          ]}
          style={{ ...panelStyle.value, ...(props.arrow ? arrowStyle.value : {}), ...originStyle.value }}
        >
          {slots.default?.()}
          {props.arrow && <div class={e("arrow")} />}
        </div>
      );

      if (transName) {
        return (
          <Teleport to="body" disabled={!props.teleported}>
            <Transition name={transName} appear
              onEnter={() => {
                nextTick(() => {
                  if (observer && panelRef.value) {
                    observer.observe(panelRef.value, {
                      childList: true,
                      subtree: true,
                      attributes: false,
                      characterData: false,
                    });
                  }
                });
              }}
              onAfterLeave={() => {
                if (observer) observer.disconnect();
              }}
            >
              {props.visible ? panel : null}
            </Transition>
          </Teleport>
        );
      }

      return (
        <Teleport to="body" disabled={!props.teleported}>
          {props.visible ? panel : null}
        </Teleport>
      );
    };
  },
});