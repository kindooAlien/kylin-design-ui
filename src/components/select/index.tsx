import {
  defineComponent,
  ref,
  computed,
  nextTick,
  onBeforeUnmount,
  watch,
  provide,
  shallowRef,
  type PropType,
} from "vue";
import KInput from "@/components/input/index";
import KScroll from "@/components/scrollbar/index";
import KTooltip from "@/components/tooltip/index";
import KIcon from "@/components/icon/index";
import KTag from "@/components/tag/index";
import KPopper from "@/components/popper/index";
import type { PopperPlacement } from "@/components/popper/index";
import { debounce } from "@/utils/debounce";
import "./index.scss";
import { type SelectOption, type SelectGroup, type SelectEffect, SELECT_CTX } from "./types";

// 全局唯一 id 生成器和当前展开的 select 实例 id（用于多实例互斥展开）
let nextSelectId = 0;
const activeSelectId = shallowRef(-1);

export default defineComponent({
  name: "KSelect",
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Array], default: "" },
    /** v-model 修饰符（Vue 自动注入：trim/lazy/number） */
    modelModifiers: {
      type: Object as PropType<Record<string, boolean>>,
      default: () => ({}),
    },
    options: { type: Array as () => SelectOption[], default: () => [] },
    placeholder: { type: String, default: "请选择" },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    size: {
      type: String as PropType<"small" | "default" | "large">,
      default: "default",
    },
    clearable: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    /** 自定义过滤方法，接收 (keyword: string, option: SelectOption) => boolean */
    filterMethod: { type: Function as PropType<(keyword: string, option: SelectOption) => boolean>, default: undefined },
    loading: { type: Boolean, default: false },
    remote: { type: Boolean, default: false },
    remoteMethod: { type: Function as any, default: undefined },
    reserveKeyword: { type: Boolean, default: false },
    /** 值唯一标识字段名，默认 'value' */
    valueKey: { type: String, default: "value" },
    prefixIcon: { type: String, default: undefined },
    suffixIcon: { type: String, default: "arrow-down" },
    clearIcon: { type: String, default: "close-bold" },
    teleported: { type: Boolean, default: true },
    popperClass: { type: String, default: undefined },
    /** 下拉面板弹出方向 */
    placement: { type: String as PropType<PopperPlacement>, default: "bottom-start" },
    /** 下拉面板最大高度 */
    maxHeight: { type: [String, Number], default: "240px" },
    /** 下拉宽度是否跟随输入框宽度 */
    fitInputWidth: { type: Boolean, default: true },
    multiple: { type: Boolean, default: false },
    maxTags: { type: Number, default: -1 },
    collapseTags: { type: Boolean, default: false },
    collapseTooltip: { type: Boolean, default: true },
    /** 无匹配数据时显示的文本 */
    noMatchText: { type: String, default: "无匹配数据" },
    /** 无数据时显示的文本（options 为空时） */
    noDataText: { type: String, default: "无数据" },
    /** 主题效果 */
    effect: { type: String as PropType<SelectEffect>, default: "light" },
    /** 默认高亮第一项 */
    defaultFirstOption: { type: Boolean, default: false },
    /** 原生 name 属性 */
    name: { type: String, default: undefined },
    /** 原生 id 属性 */
    nativeId: { type: String, default: undefined },
    /** 原生 autocomplete 属性 */
    autocomplete: { type: String, default: undefined },
    /** aria-label */
    ariaLabel: { type: String, default: undefined },
  },
  emits: ["update:modelValue", "change", "visible-change", "remove-tag", "clear", "focus", "blur"],

  setup(props, { emit, slots }) {
    const triggerRef = ref<HTMLElement>();
    const inputRef = ref<any>();

    const visible = ref(false);
    const query = ref("");
    const labelCache = ref<Record<string | number, string>>({});
    const composing = ref(false);
    const slotOptions = ref<SelectOption[]>([]);
    const isFocused = ref(false);

    // 清理不可见字符（IME 零宽字符等）
    const normalizeValue = (v: string) =>
      v
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();

    const handleCompositionEnd = (e: CompositionEvent) => {
      composing.value = false;
      const value = normalizeValue((e.target as HTMLInputElement).value);
      query.value = value;
      // 强制触发远程搜索（绕过 debounce 在 composition 期间的时序问题）
      if (props.remote && props.filterable) {
        callRemoteMethod(value);
      }
    };

    const instanceId = ref(nextSelectId++);

    const addOption = (option: SelectOption) => {
      // 避免重复添加导致死循环
      const exists = slotOptions.value.some((o) => o.value === option.value);
      if (exists) return;
      slotOptions.value = [...slotOptions.value, option];
    };
    const removeOption = (value: string | number) => {
      slotOptions.value = slotOptions.value.filter((o) => o.value !== value);
    };

    provide(SELECT_CTX, { addOption, removeOption });

    const allOptions = computed(() => [...props.options, ...slotOptions.value]);

    const selectedLabel = computed(() => {
      if (props.multiple) return "";
      const value = props.modelValue;
      if (value == null || Array.isArray(value)) return "";
      const option = allOptions.value.find((o) => o.value === value);
      return option?.label ?? labelCache.value[value] ?? "";
    });

    const inputText = computed({
      get() {
        if (props.multiple) return query.value;
        if (props.filterable && visible.value) return query.value;
        return selectedLabel.value;
      },
      set(val) {
        query.value = String(val || "");
      },
    });

    const selectedOptions = computed<SelectOption[]>(() => {
      if (!props.multiple) return [];
      const values = Array.isArray(props.modelValue)
        ? (props.modelValue as (string | number)[])
        : [];
      return values
        .map((v) => {
          const option = allOptions.value.find((o) => o.value === v);
          return option || { label: String(v), value: v };
        })
        .filter((o) => o.label);
    });

    const collapsedDisplayTags = computed(() => {
      if (
        !props.multiple ||
        !props.collapseTags ||
        selectedOptions.value.length <= 0
      )
        return [];
      const maxTags = props.maxTags > 0 ? props.maxTags : 1;
      if (selectedOptions.value.length <= maxTags) return selectedOptions.value;
      return selectedOptions.value.slice(0, maxTags);
    });

    const hiddenTagCount = computed(() => {
      if (!props.multiple || !props.collapseTags) return 0;
      const maxTags = props.maxTags > 0 ? props.maxTags : 1;
      return Math.max(0, selectedOptions.value.length - maxTags);
    });

    // 高亮第一项（键盘导航用）
    const highlightIndex = ref(-1);

    const getPlaceholder = () => {
      if (!props.multiple) {
        return props.filterable
          ? visible.value
            ? selectedLabel.value || props.placeholder
            : props.placeholder
          : props.placeholder;
      }
      return selectedOptions.value.length === 0 ? props.placeholder : "";
    };

    const remoteLoading = ref(false);
    const remoteResults = ref<SelectOption[]>([]);

    const callRemoteMethod = (searchTerm: string) => {
      if (!props.remote || !props.remoteMethod) return;
      if (!searchTerm.trim() && !props.reserveKeyword) {
        remoteResults.value = [];
        return;
      }
      remoteLoading.value = true;
      try {
        const result = props.remoteMethod(searchTerm);
        if (result && typeof result.then === "function") {
          result
            .then((results: SelectOption[]) => {
              if (Array.isArray(results)) {
                remoteResults.value = results;
              }
            })
            .catch((error: Error) =>
              console.error("Remote search failed:", error)
            )
            .finally(() => (remoteLoading.value = false));
        } else if (Array.isArray(result)) {
          remoteResults.value = result;
          remoteLoading.value = false;
        } else {
          remoteLoading.value = false;
        }
      } catch (error) {
        console.error("Remote search failed:", error);
        remoteLoading.value = false;
      }
    };

    const debouncedRemoteSearch = debounce((searchTerm: string) => {
      callRemoteMethod(searchTerm);
    }, 300);

    watch(query, (newVal) => {
      // filterable 模式下，输入内容时自动打开下拉框
      if (props.filterable && newVal && !visible.value) {
        visible.value = true;
        emit("visible-change", true);
      }

      if (props.remote && props.remoteMethod && props.filterable) {
        if (!newVal.trim()) {
          remoteResults.value = [];
        } else {
          debouncedRemoteSearch(newVal);
        }
      }
    });

    watch(visible, (v) => {
      if (!v) {
        if (!props.multiple && !props.remote) query.value = "";
        highlightIndex.value = -1;
      } else if (props.defaultFirstOption) {
        nextTick(() => {
          const list = flatOptions.value;
          if (list.length > 0) highlightIndex.value = 0;
        });
      }
    });

    // 扁平选项列表（用于键盘导航）
    const flatOptions = computed(() => {
      const { groups, ungrouped } = groupedOptions.value;
      const result: SelectOption[] = [...ungrouped];
      for (const g of groups) {
        result.push(...g.options);
      }
      return result;
    });

    const filteredOptions = computed(() => {
      if (props.remote && props.filterable && props.remoteMethod) {
        if (query.value.trim()) return remoteResults.value;
        return remoteResults.value;
      }
      if (!props.filterable || !query.value.trim()) return allOptions.value;
      const term = query.value.toLowerCase();
      // 如果有自定义 filterMethod，使用它
      if (props.filterMethod) {
        return allOptions.value.filter((o) => props.filterMethod!(term, o));
      }
      return allOptions.value.filter(
        (o) =>
          o.label.toLowerCase().includes(term) ||
          String(o.value).toLowerCase().includes(term)
      );
    });

    // 当 filteredOptions 变化时，如果 defaultFirstOption 开启，重置高亮
    watch(filteredOptions, (list) => {
      if (props.defaultFirstOption && visible.value && list.length > 0) {
        highlightIndex.value = 0;
      }
    });

    const groupedOptions = computed(() => {
      const groups: SelectGroup[] = [];
      const ungrouped: SelectOption[] = [];
      filteredOptions.value.forEach((option) => {
        if (option.group) {
          let g = groups.find((g) => g.label === option.group);
          if (!g) {
            g = { label: option.group, options: [] };
            groups.push(g);
          }
          g.options.push(option);
        } else {
          ungrouped.push(option);
        }
      });
      return { groups, ungrouped };
    });

    const isOptionSelected = (optionValue: string | number) => {
      if (!props.multiple) return props.modelValue === optionValue;
      const currentValues = Array.isArray(props.modelValue)
        ? props.modelValue
        : [];
      return currentValues.includes(optionValue);
    };

    const lastToggleTime = ref(0);

    const toggleVisible = () => {
      if (props.disabled || props.readonly) return;
      const now = Date.now();
      if (lastToggleTime.value && now - lastToggleTime.value < 150) return;
      lastToggleTime.value = now;
      const willOpen = !visible.value;
      if (willOpen) {
        activeSelectId.value = instanceId.value;
      }
      visible.value = willOpen;
      emit("visible-change", willOpen);
      if (willOpen) {
        nextTick(() => {
          if (!props.multiple) inputRef.value?.focus?.();
        });
      }
    };

    const handleClear = (e?: MouseEvent) => {
      e?.stopPropagation();
      if (props.multiple) {
        emit("update:modelValue", applyModifiers([]));
        emit("change", []);
      } else {
        emit("update:modelValue", applyModifiers(""));
        emit("change", "");
      }
      query.value = "";
      emit("clear");
      if (props.filterable) {
        if (!visible.value) {
          visible.value = true;
          emit("visible-change", true);
        }
        nextTick(() => {
          if (props.multiple) {
            (inputRef.value as HTMLInputElement | undefined)?.focus?.();
          } else {
            const el = inputRef.value?.$el as HTMLElement | undefined;
            const input = el?.querySelector?.("input") || el?.querySelector?.("textarea");
            input?.focus?.();
          }
        });
      } else {
        visible.value = false;
        emit("visible-change", false);
      }
    };

    const handleRemoveTag = (option: SelectOption, e?: MouseEvent) => {
      if (e) e.stopPropagation();
      if (props.disabled) return;
      const currentValues = Array.isArray(props.modelValue)
        ? props.modelValue
        : [];
      const newValue = currentValues.filter((v) => v !== option.value);
      emit("update:modelValue", newValue);
      emit("change", newValue);
      emit("remove-tag", option.value);
    };

    // 监听多选值变化，删除选项后聚焦输入框（flush: 'post' 保证 DOM 已更新）
    watch(() => (props.multiple ? props.modelValue : null), () => {
      if (props.multiple && props.filterable) {
        const el = inputRef.value;
        if (el) {
          if (el instanceof HTMLInputElement) {
            el.focus();
          } else if ((el as any)?.$el) {
            const input = (el as any).$el.querySelector('input') || (el as any).$el.querySelector('textarea');
            input?.focus();
          }
        }
      }
    }, { flush: 'post' });


    const applyModifiers = (value: any): any => {
      let v = value;
      if (props.modelModifiers?.trim && typeof v === 'string') {
        v = v.trim();
      }
      if (props.modelModifiers?.number && typeof v === 'string') {
        const num = Number(v);
        if (!isNaN(num)) v = num;
      }
      return v;
    };

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;
      labelCache.value[option.value] = option.label;
      if (props.multiple) {
        const currentValues = Array.isArray(props.modelValue)
          ? props.modelValue
          : [];
        const exists = currentValues.includes(option.value);
        const newValue = exists
          ? currentValues.filter((v) => v !== option.value)
          : [...currentValues, option.value];
        emit("update:modelValue", applyModifiers(newValue));
        emit("change", applyModifiers(newValue));
        query.value = "";
        highlightIndex.value = -1;
        nextTick(() => {
          if (props.multiple) {
            (inputRef.value as HTMLInputElement | undefined)?.focus?.();
          }
        });
      } else {
        emit("update:modelValue", applyModifiers(option.value));
        emit("change", applyModifiers(option.value));
        visible.value = false;
        emit("visible-change", false);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      // 多选下退格键删除最后一个选项
      if (props.multiple && e.key === "Backspace" && !query.value) {
        e.preventDefault();
        const currentValues = Array.isArray(props.modelValue)
          ? props.modelValue
          : [];
        if (currentValues.length > 0) {
          const lastValue = currentValues[currentValues.length - 1];
          const lastOption = allOptions.value.find((o) => o.value === lastValue);
          if (lastOption) {
            handleRemoveTag(lastOption);
          }
        }
        return;
      }

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
      }

      // 上下键导航
      if (visible.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const list = flatOptions.value;
        if (list.length === 0) return;
        const step = e.key === "ArrowDown" ? 1 : -1;
        let newIndex = highlightIndex.value + step;
        if (newIndex < 0) newIndex = list.length - 1;
        if (newIndex >= list.length) newIndex = 0;
        highlightIndex.value = newIndex;
        nextTick(() => {
          const el = document.querySelector(`[data-select-index="${newIndex}"]`);
          el?.scrollIntoView({ block: "nearest" });
        });
        return;
      }

      // Enter 选中高亮项
      if (e.key === "Enter") {
        if (visible.value && highlightIndex.value >= 0 && highlightIndex.value < flatOptions.value.length) {
          e.preventDefault();
          handleSelect(flatOptions.value[highlightIndex.value]);
          return;
        }
        toggleVisible();
        return;
      }

      if (e.key === "Escape") {
        visible.value = false;
        emit("visible-change", false);
        return;
      }

      if (e.key === "Tab") {
        if (visible.value) {
          visible.value = false;
          emit("visible-change", false);
        }
        return;
      }

      // 输入时重置高亮
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
        highlightIndex.value = -1;
      }
    };

    const handleFocus = () => {
      isFocused.value = true;
      emit("focus");
    };

    const handleBlur = () => {
      isFocused.value = false;
      emit("blur");
    };

    onBeforeUnmount(() => {
      debouncedRemoteSearch.cancel();
    });

    const renderDropdown = () => {
      const { groups, ungrouped } = groupedOptions.value;
      if (!groups.length && !ungrouped.length) {
        if (props.remote && props.filterable) {
          const tip = !query.value.trim()
            ? "请输入关键词搜索"
            : remoteLoading.value
              ? "搜索中..."
              : props.noMatchText;
          return (
            <div class="k-select-dropdown__empty">
              <KIcon name="column-horizontal" class="k-select-dropdown__empty-icon" />
              <span>{tip}</span>
            </div>
          );
        }
        // 有 filterable 且有搜索词但没结果 → noMatchText
        if (props.filterable && query.value.trim()) {
          return (
            <div class="k-select-dropdown__empty">
              <KIcon name="column-horizontal" class="k-select-dropdown__empty-icon" />
              <span>{props.noMatchText}</span>
            </div>
          );
        }
        return (
          <div class="k-select-dropdown__empty">
            <KIcon name="column-horizontal" class="k-select-dropdown__empty-icon" />
            <span>{props.noDataText}</span>
          </div>
        );
      }

      return [
        ungrouped.map((option) => {
          const globalIdx = flatOptions.value.indexOf(option);
          return (
          <KTooltip
            key={option.value}
            content={option.tooltip}
            disabled={!option.tooltip}
            placement="right"
          >
            <div
              role="option"
              aria-selected={isOptionSelected(option.value)}
              data-select-index={globalIdx}
              class={[
                "k-select-dropdown__item",
                isOptionSelected(option.value) && "is-selected",
                option.disabled && "is-disabled",
                globalIdx === highlightIndex.value && "is-highlight",
              ]}
              onPointerdown={(e: MouseEvent) => {
                e.preventDefault();
                handleSelect(option);
              }}
            >
              {option.label}
              {props.multiple && isOptionSelected(option.value) && (
                <KIcon
                  name="select-bold"
                  class="k-select-item__selected-icon"
                />
              )}
            </div>
          </KTooltip>
        )}),
        groups.map((group) => (
          <div key={group.label} class="k-select-dropdown__group">
            <div class="k-select-dropdown__group-label">{group.label}</div>
            <div class="k-select-dropdown__group-options">
              {group.options.map((option) => {
                const globalIdx = flatOptions.value.indexOf(option);
                return (
                <KTooltip
                  key={option.value}
                  content={option.tooltip}
                  disabled={!option.tooltip}
                  placement="right"
                >
                  <div
                    role="option"
                    aria-selected={isOptionSelected(option.value)}
                    data-select-index={globalIdx}
                    class={[
                      "k-select-dropdown__item",
                      isOptionSelected(option.value) && "is-selected",
                      option.disabled && "is-disabled",
                      globalIdx === highlightIndex.value && "is-highlight",
                    ]}
                    onPointerdown={(e: MouseEvent) => {
                      e.preventDefault();
                      handleSelect(option);
                    }}
                  >
                    {option.label}
                    {props.multiple && isOptionSelected(option.value) && (
                      <KIcon
                        name="select-bold"
                        class="k-select-item__selected-icon"
                      />
                    )}
                  </div>
                </KTooltip>
              )})}
            </div>
          </div>
        )),
      ];
    };

    // 监听全局活跃实例变化，当其他 select 展开时自己收起
    watch(activeSelectId, (newId) => {
      if (newId !== instanceId.value && visible.value) {
        visible.value = false;
        emit("visible-change", false);
      }
    });

    const Dropdown = () => (
      <KPopper
        visible={visible.value}
        triggerRef={triggerRef}
        placement={props.placement}
        gap={4}
        margin={8}
        autoFlip={true}
        arrow={false}
        zIndex={2100}
        closeOnClickOutside={true}
        scrollFollow={true}
        transition="slide-fade"
        width={props.fitInputWidth && triggerRef.value?.offsetWidth
          ? `${triggerRef.value.offsetWidth}px`
          : undefined}
        popperClass="k-select-dropdown-wrapper"
        onUpdate:visible={(v: boolean) => {
          if (!v) {
            visible.value = false;
            emit("visible-change", false);
          }
        }}
      >
        <div class="k-select-dropdown">
          <KScroll max-height={props.maxHeight}>
            <div class="k-select-dropdown__content">
              {renderDropdown()}
            </div>
          </KScroll>
        </div>
      </KPopper>
    );

    return () => (
      <div
        ref={triggerRef}
        tabindex={props.disabled ? -1 : 0}
        class={[
          "k-select",
          visible.value && "is-focused",
          props.disabled && "is-disabled",
          props.readonly && "is-readonly",
          props.multiple && "is-multiple",
          `k-select--${props.effect}`,
        ]}
        {...(props.nativeId ? { id: props.nativeId } : {})}
        {...(props.name ? { name: props.name } : {})}
        {...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {})}
        onPointerdown={(e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (
            target.closest(".k-select__clear") ||
            target.closest(".k-input__clear") ||
            target.closest(".k-tag__close")
          ) {
            e.stopPropagation();
            return;
          }
          toggleVisible();
          e.stopPropagation();
        }}
        onKeydown={(e: KeyboardEvent) => {
          if (!props.filterable && e.key !== "Enter" && e.key !== "Escape") {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          handleKeydown(e);
        }}
      >
        {Dropdown()}
        {slots.default?.()}
        {props.multiple ? (
          <>
            {selectedOptions.value.length > 0 ? (
              <div class="k-select-input k-select-input--multiple">
                <div class="k-select-tags">
                  {props.collapseTags ? (
                    <>
                      {collapsedDisplayTags.value.map((option) => (
                        <KTag
                          key={option.value}
                          type="primary"
                          size={props.size === "default" ? "small" : props.size}
                          closable={!props.disabled}
                          onClose={(e: Event) =>
                            handleRemoveTag(option, e as MouseEvent)
                          }
                          class="k-select-tag"
                        >
                          {option.label}
                        </KTag>
                      ))}
                      {hiddenTagCount.value > 0 && (
                        <KTooltip
                          content={
                            props.collapseTooltip
                              ? selectedOptions.value
                                  .slice(props.maxTags > 0 ? props.maxTags : 1)
                                  .map((opt) => opt.label)
                                  .join(", ")
                              : undefined
                          }
                          disabled={
                            !props.collapseTooltip ||
                            selectedOptions.value.length <=
                              (props.maxTags > 0 ? props.maxTags : 1)
                          }
                          placement="top"
                        >
                          <span class="k-select__tags-text">
                            +{hiddenTagCount.value}
                          </span>
                        </KTooltip>
                      )}
                    </>
                  ) : (
                    selectedOptions.value.map((option) => (
                      <KTag
                        key={option.value}
                        type="primary"
                        size={props.size === "default" ? "small" : props.size}
                        closable={!props.disabled}
                        onClose={(e: Event) =>
                          handleRemoveTag(option, e as MouseEvent)
                        }
                        class="k-select-tag"
                      >
                        {option.label}
                      </KTag>
                    ))
                  )}
                  {props.filterable && (
                    <span class="k-select__input-wrapper">
                      <input
                        ref={inputRef}
                        type="text"
                        class="k-select__input"
                        value={query.value}
                        onInput={(e: Event) =>
                          !composing.value &&
                          (query.value = normalizeValue((e.target as HTMLInputElement).value))
                        }
                        onCompositionstart={() => (composing.value = true)}
                        onCompositionend={handleCompositionEnd}
                        placeholder={getPlaceholder()}
                        disabled={props.disabled}
                        readonly={props.readonly}
                        onClick={(e: Event) => {
                          e.stopPropagation();
                          if (!visible.value) toggleVisible();
                        }}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                      />
                    </span>
                  )}
                </div>
                <div class="k-select-suffix">
                  {props.clearable && selectedOptions.value.length > 0 && (
                    <KIcon
                      name={props.clearIcon}
                      class="k-select__clear"
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                    />
                  )}
                  <KIcon
                    name={remoteLoading.value ? "loading" : props.suffixIcon}
                    class={["k-select__caret", visible.value && "is-open"]}
                  />
                </div>
              </div>
            ) : (
              <div class="k-select-input-wrapper">
                <KInput
                  ref={inputRef}
                  readonly={!props.filterable}
                  modelValue={props.filterable ? query.value : undefined}
                  onUpdate:modelValue={(v) => (query.value = String(v))}
                  placeholder={getPlaceholder()}
                  size={props.size}
                  disabled={props.disabled}
                  clearable={false}
                  prefixIcon={props.prefixIcon}
                  class={[
                    "k-select-input",
                    visible.value && "select-dropdown-visible",
                  ]}
                  onCompositionstart={() => (composing.value = true)}
                  onCompositionend={handleCompositionEnd}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {props.clearable && selectedOptions.value.length > 0 && (
                  <KIcon
                    name={props.clearIcon}
                    class="k-select__clear"
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  />
                )}
                <KIcon
                  name={remoteLoading.value ? "loading" : props.suffixIcon}
                  class={["k-select__caret", visible.value && "is-open"]}
                />
              </div>
            )}
          </>
        ) : (
          <KInput
            ref={inputRef}
            readonly={!props.filterable}
            modelValue={inputText.value}
            onUpdate:modelValue={(v) => (query.value = String(v))}
            placeholder={getPlaceholder()}
            size={props.size}
            disabled={props.disabled}
            clearable={props.clearable && props.modelValue !== ""}
            clearIcon={props.clearIcon}
            prefixIcon={props.prefixIcon}
            onClear={handleClear}
            class={[
              "k-select-input",
              visible.value && "select-dropdown-visible",
            ]}
            onCompositionstart={() => (composing.value = true)}
            onCompositionend={handleCompositionEnd}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            {{
              suffix: () => (
                <KIcon
                  name={remoteLoading.value ? "loading" : props.suffixIcon}
                  class={["k-select__caret", { "is-open": visible.value }]}
                />
              ),
            }}
          </KInput>
        )}
      </div>
    );
  },
});