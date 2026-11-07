import { defineComponent, inject, onUnmounted, watchEffect, type PropType } from 'vue'
import type { SelectOption } from './types'
import { SELECT_CTX } from './types'
import { GROUP_CTX } from './option-group'

export default defineComponent({
  name: 'KOption',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    disabled: { type: Boolean, default: false },
    tooltip: { type: String, default: undefined },
    /** 多选模式下 Tag 的额外 props */
    tagProps: { type: Object as PropType<Record<string, any>>, default: undefined },
    /** 自定义类名 */
    class: { type: String, default: undefined },
  },
  setup(props) {
    const selectContext = inject<{
      addOption: (option: SelectOption) => void
      removeOption: (optionValue: string | number) => void
    } | null>(SELECT_CTX)
    
    const groupContext = inject<{ label: string } | null>(GROUP_CTX, null)
    
     watchEffect(() => {
       if (selectContext) {
         selectContext.addOption({
           label: props.label,
           value: props.value,
           disabled: props.disabled,
           tooltip: props.tooltip,
           tagProps: props.tagProps,
           group: groupContext?.label,
         })
       }
     })
    
    onUnmounted(() => {
      if (selectContext) {
        selectContext.removeOption(props.value)
      }
    })
    
    return () => null
  },
})