import {
  defineComponent,
  ref,
  computed,
  onBeforeUnmount,
  type PropType,
} from "vue";
import { createBem } from "@/utils/create-bem";
import KIcon from "@/components/icon/index";
import KButton from "@/components/button/index";
import KOverlay from "@/components/overlay/index";
import type { KOverlayMaskType } from "@/components/overlay/index";
import KScroll from "@/components/scrollbar/index";
import "./index.scss";

const [, e, m, v] = createBem("k-dialog");

export type DialogSize = "small" | "default" | "large";
export type DialogAlign = "top" | "center";
export type DialogAnimation = "scale" | "slide" | "bounce";

export default defineComponent({
  name: "KDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: "提示" },
    size: {
      type: String as PropType<DialogSize>,
      default: "default",
    },
    width: { type: String, default: undefined },
    height: { type: String, default: undefined },
    maxHeight: { type: String, default: undefined },
    minHeight: { type: String, default: undefined },
    maxWidth: { type: String, default: undefined },
    minWidth: { type: String, default: undefined },
    top: { type: String, default: undefined },
    align: { type: String as PropType<DialogAlign>, default: "center" },
    showClose: { type: Boolean, default: true },
    closeOnClickOverlay: { type: Boolean, default: true },
    closeOnPressEscape: { type: Boolean, default: true },
    teleported: { type: Boolean, default: true },
    customClass: { type: String, default: undefined },
    confirmText: { type: String, default: "确 认" },
    cancelText: { type: String, default: "取 消" },
    showCancel: { type: Boolean, default: true },
    confirmLoading: { type: Boolean, default: false },
    confirmDisabled: { type: Boolean, default: false },
    /** 点击确认后是否自动关闭弹窗；异步确认场景设为 false，自行控制关闭时机 */
    closeOnConfirm: { type: Boolean, default: true },
    overlayBackground: { type: String, default: undefined },
    /** 遮罩类型：dimmed 暗色（默认）/ blur 毛玻璃（透传 KOverlay） */
    maskType: { type: String as PropType<KOverlayMaskType>, default: "dimmed" },
    overlayZIndex: { type: Number, default: undefined },
    /** 样式通过 CSS var 和 customClass 覆盖，不再提供细粒度样式 props */
    /** 是否可拖拽 */
    draggable: { type: Boolean, default: false },
    /** 是否可全屏 */
    fullscreen: { type: Boolean, default: false },
    /** 动画类型 */
    animation: {
      type: String as PropType<DialogAnimation>,
      default: "scale",
    },
  },
  emits: ["update:modelValue", "open", "close", "opened", "closed", "confirm", "cancel", "fullscreen-change"],

  setup(props, { emit, slots }) {
    const dialogRef = ref<HTMLElement>();
    const isOpened = ref(false);

    /* ====================== 工具函数 ====================== */

    const resetDragStyle = (el: HTMLElement) => {
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
      el.style.transform = "";
      el.style.transition = "";
    };

    /* ====================== 全屏 ====================== */

    const isFullscreen = ref(false);

    const toggleFullscreen = () => {
      const entering = !isFullscreen.value;
      isFullscreen.value = entering;
      emit("fullscreen-change", entering);
      if (entering && dialogRef.value) {
        resetDragStyle(dialogRef.value);
        dragState.value.offsetX = 0;
        dragState.value.offsetY = 0;
      }
    };

    /* ====================== 拖拽 ====================== */
    // 拖拽是低优先级功能，以下实现使用 position:fixed + left/top 定位，
    //    避免 transform 与动画冲突。全屏时自动禁用。
    //    后续可考虑抽成 KDraggable 指令。

    const dragState = ref({
      dragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    });

    const onHeaderPointerDown = (e: PointerEvent) => {
      if (!props.draggable || isFullscreen.value) return;
      // 按钮和有 data-no-drag 标记的元素不启动拖拽
      const target = e.target as HTMLElement;
      if (target.closest("button, [data-no-drag]")) return;
      const el = dialogRef.value;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragState.value = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: rect.left,
        offsetY: rect.top,
      };
      el.setPointerCapture(e.pointerId);
      el.addEventListener("pointermove", onPointerMove);
      el.addEventListener("pointerup", onPointerUp);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragState.value.dragging) return;
      const dx = e.clientX - dragState.value.startX;
      const dy = e.clientY - dragState.value.startY;
      const el = dialogRef.value;
      if (el) {
        el.style.position = "fixed";
        el.style.left = `${dragState.value.offsetX + dx}px`;
        el.style.top = `${dragState.value.offsetY + dy}px`;
        el.style.transition = "none";
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragState.value.dragging) return;
      const el = dialogRef.value;
      if (el) {
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("pointerup", onPointerUp);
        el.releasePointerCapture(e.pointerId);
        el.style.transition = "";
        const dx = e.clientX - dragState.value.startX;
        const dy = e.clientY - dragState.value.startY;
        dragState.value.offsetX += dx;
        dragState.value.offsetY += dy;
      }
      dragState.value.dragging = false;
    };

    /* ====================== 动画 ====================== */

    const animPhase = ref<"enter" | "leave" | "">("");

    const animClass = computed(() => {
      if (!animPhase.value) return "";
      const prefix = `k-dialog-${props.animation}`;
      return `${prefix}-${animPhase.value}`;
    });

    /* ====================== 事件转发 ====================== */

    const handleOpen = () => {
      // 先清空 class，确保 DOM 在无动画状态下渲染一帧
      animPhase.value = "";
      // 双 rAF 确保浏览器已 paint 初始状态后再开始动画，避免 Safari 丢帧
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animPhase.value = "enter";
        });
      });
      isOpened.value = true;
      emit("open");
    };

    const handleOpened = () => {
      animPhase.value = "";
      bindEvents();
      emit("opened");
    };

    const handleClose = () => {
      if (animPhase.value === "leave") return; // 已在离场中，防止重入
      animPhase.value = "leave";
      emit("close");
    };

    const handleClosed = () => {
      animPhase.value = "";
      unbindEvents();
      isFullscreen.value = false;
      isOpened.value = false;
      emit("closed");
    };

    const handleCancel = () => {
      // 与 EP 一致：取消/确认默认关闭弹窗，调用方在 onConfirm/onCancel 里做业务处理
      emit("cancel");
      emit("update:modelValue", false);
    };

    const handleConfirm = () => {
      emit("confirm");
      if (props.closeOnConfirm) {
        emit("update:modelValue", false);
      }
    };

    /* ====================== 事件管理 ====================== */

    const bindEvents = () => {
      document.addEventListener("keydown", handleKeydown);
    };

    const unbindEvents = () => {
      document.removeEventListener("keydown", handleKeydown);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && props.closeOnPressEscape) {
        if (isFullscreen.value) {
          isFullscreen.value = false;
          if (dialogRef.value) resetDragStyle(dialogRef.value);
        } else {
          emit("update:modelValue", false);
        }
      }
    };

    /* ====================== 清理 ====================== */

    onBeforeUnmount(() => {
      unbindEvents();
    });

    /* ====================== wrapper 样式 ====================== */

    const wrapperStyle = computed(() => {
      const s: Record<string, string> = {};
      if (props.width) s.width = props.width;
      if (props.height && !isFullscreen.value) s.height = props.height;
      if (props.maxHeight && !isFullscreen.value) s.maxHeight = props.maxHeight;
      if (props.minHeight && !isFullscreen.value) s.minHeight = props.minHeight;
      if (props.maxWidth && !isFullscreen.value) s.maxWidth = props.maxWidth;
      if (props.minWidth && !isFullscreen.value) s.minWidth = props.minWidth;
      if (props.top && props.align === "top" && !isFullscreen.value) {
        s.marginTop = props.top;
      }
      return s;
    });

    /* ====================== wrapper class ====================== */

    const wrapperClass = computed(() => {
      const classes = [
        e("wrapper"),
        v(props.size, true),
        v(props.align, props.align !== "center"),
        v("fullscreen", isFullscreen.value),
        props.customClass,
      ];
      if (isFullscreen.value) classes.push(e("wrapper--fullscreen"));
      if (animClass.value) classes.push(animClass.value);
      return classes;
    });

    /* ====================== 渲染 ====================== */

    return () => {
      return (
        <KOverlay
          modelValue={props.modelValue}
          closeOnClick={props.closeOnClickOverlay}
          teleported={props.teleported}
          background={props.overlayBackground}
          maskType={props.maskType}
          zIndex={props.overlayZIndex}
          onUpdate:modelValue={(v) => {
            if (!v) emit("update:modelValue", false);
          }}
          onOpen={handleOpen}
          onOpened={handleOpened}
          onClose={handleClose}
          onClosed={handleClosed}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabindex={-1}
            class={wrapperClass.value}
            style={wrapperStyle.value}
            onPointerdown={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div
              class={[e("header"), m("draggable", props.draggable && !isFullscreen.value)]}
              onPointerdown={props.draggable ? onHeaderPointerDown : undefined}
            >
              <span class={e("title")}>
                {slots.title ? slots.title() : props.title}
              </span>
              <div class={e("header-actions")}>
                {props.fullscreen && (
                  <button
                    type="button"
                    class={e("header-btn")}
                    data-no-drag
                    aria-label={isFullscreen.value ? "Exit fullscreen" : "Fullscreen"}
                    onClick={toggleFullscreen}
                  >
                    {/* 图标名须与 iconfont 注册表一致（fullscreen-shrink/expand），
                        此前误写 fullscreen/fullscreen-exit 导致图标空白 */}
                    <KIcon
                      name={isFullscreen.value ? "fullscreen-shrink" : "fullscreen-expand"}
                      size={14}
                    />
                  </button>
                )}
                {props.showClose && (
                  <button
                    type="button"
                    class={e("close")}
                    data-no-drag
                    aria-label="Close"
                    onClick={() => emit("update:modelValue", false)}
                  >
                    <KIcon name="close-bold" size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 内容区域 */}
            <KScroll class={e("body")}>
              <div class={e("body-content")}>
                {slots.default?.()}
              </div>
            </KScroll>

            {/* 底部按钮 */}
            {(slots.footer || props.showCancel) && (
              <div class={e("footer")}>
                {slots.footer ? (
                  slots.footer()
                ) : (
                  <>
                    {props.showCancel && (
                      <KButton type="default" onClick={handleCancel}>
                        {props.cancelText}
                      </KButton>
                    )}
                    <KButton
                      type="primary"
                      loading={props.confirmLoading}
                      disabled={props.confirmDisabled}
                      onClick={handleConfirm}
                    >
                      {props.confirmText}
                    </KButton>
                  </>
                )}
              </div>
            )}
          </div>
        </KOverlay>
      );
    };
  },
});