import { defineComponent, ref, computed, type PropType } from 'vue'
import { createBem } from '@/utils/create-bem'
import KInput from '@/components/input/index'
import KIcon from '@/components/icon/index'
import KPopper from '@/components/popper/index'
import KScroll from '@/components/scrollbar/index'
import KTree from '@/components/tree/index'
import type { TreeNodeData } from '@/components/tree/types'
import './index.scss'

const [b, e] = createBem('k-tree-select')

/**
 * TreeSelect 树形选择器。
 *
 * 触发器外观与 KSelect 一致（输入框样式 + 展开箭头 + 可清空），
 * 下拉面板内嵌 KTree：点击叶子节点完成选择并收起面板；
 * 点击父节点仍按 KTree 约定展开/收起（父节点暂不可直接选中）。
 */
export default defineComponent({
  name: 'KTreeSelect',
  props: {
    /** 树数据源（嵌套结构，字段同 KTree 默认约定） */
    data: { type: Array as PropType<TreeNodeData[]>, required: true },
    /** 当前选中节点 id（v-model） */
    modelValue: { type: String, default: '' },
    /** 占位文本 */
    placeholder: { type: String, default: '请选择' },
    /** 是否禁用 */
    disabled: { type: Boolean, default: false },
    /** 是否可清空（悬浮触发器时出现清除图标） */
    clearable: { type: Boolean, default: false },
    /** 默认展开所有节点（透传面板内 KTree） */
    defaultExpandAll: { type: Boolean, default: false },
    /** 下拉面板最大高度 */
    maxHeight: { type: [String, Number], default: '264px' },
  },
  emits: [
    /** v-model：选中节点变化时触发，载荷为节点 id */
    'update:modelValue',
    /** 选中节点变化时触发，载荷为节点 id */
    'change',
    /** 选中节点时触发，载荷为该节点原始数据 */
    'select',
    /** 下拉面板展开/收起时触发，载荷为布尔值 */
    'visibleChange',
    /** 点击清空图标时触发 */
    'clear',
  ],
  setup(props, { emit }) {
    const triggerRef = ref<HTMLElement | null>(null)
    const visible = ref(false)
    /** 面板宽度与触发器等宽 */
    const panelWidth = ref<number>()

    /** 在 data 中按 id 查找节点（DFS，用于回显标签） */
    const findNode = (
      nodes: TreeNodeData[],
      id: string,
    ): TreeNodeData | undefined => {
      for (const node of nodes) {
        if (node.id === id) return node
        const found = node.children ? findNode(node.children, id) : undefined
        if (found) return found
      }
      return undefined
    }

    /** 当前选中节点（用于触发器回显标签） */
    const selectedNode = computed(() =>
      props.modelValue ? findNode(props.data, props.modelValue) : undefined,
    )

    const setVisible = (v: boolean) => {
      if (props.disabled) return
      visible.value = v
      if (v) {
        panelWidth.value = triggerRef.value?.offsetWidth
      }
      emit('visibleChange', v)
    }

    const handleTriggerClick = () => {
      setVisible(!visible.value)
    }

    const handleSelect = (node: TreeNodeData) => {
      emit('update:modelValue', node.id)
      emit('change', node.id)
      emit('select', node)
      visible.value = false
      emit('visibleChange', false)
    }

    /** 清空选中（与 KSelect 一致：阻断冒泡，不切换面板） */
    const handleClearClick = (ev: MouseEvent) => {
      ev.stopPropagation()
      emit('update:modelValue', '')
      emit('change', '')
      emit('clear')
    }

    return () => (
      <div class={b()}>
        <div
          ref={triggerRef}
          class={[e('trigger'), props.disabled && 'is-disabled', visible.value && 'is-open']}
          onClick={handleTriggerClick}
        >
          <KInput
            readonly
            modelValue={selectedNode.value ? String(selectedNode.value.label) : ''}
            placeholder={props.placeholder}
            disabled={props.disabled}
            class={e('input')}
          />
          {props.clearable && !!selectedNode.value && !props.disabled && (
            <KIcon name="close-bold" class={e('clear')} onClick={handleClearClick} />
          )}
          <KIcon name="arrow-down" class={[e('caret'), visible.value && 'is-open']} />
        </div>
        <KPopper
          visible={visible.value}
          onUpdate:visible={(v: boolean) => {
            if (!v && visible.value) {
              visible.value = false
              emit('visibleChange', false)
            }
          }}
          triggerRef={triggerRef}
          placement="bottom-start"
          width={panelWidth.value}
          transition="slide-fade"
        >
          <div class={e('panel')}>
            <KScroll
              max-height={
                typeof props.maxHeight === 'number'
                  ? `${props.maxHeight}px`
                  : props.maxHeight
              }
            >
              <KTree
                data={props.data}
                default-expand-all={props.defaultExpandAll}
                modelValue={props.modelValue}
                onSelect={handleSelect}
              />
            </KScroll>
          </div>
        </KPopper>
      </div>
    )
  },
})
