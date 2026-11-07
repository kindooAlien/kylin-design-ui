

import { defineComponent, computed } from 'vue'
import { createBem } from '@/utils/create-bem'
import './index.scss'

// Size type
type SwitchSize = 'small' | 'default' | 'large'

const [b, e, m, v] = createBem('switch')

export default defineComponent({
  name: 'KSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String as () => SwitchSize,
      default: 'default',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    activeColor: {
      type: String,
      default: 'var(--k-color-primary)',
    },
    inactiveColor: {
      type: String,
      default: 'var(--k-color-border)',
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
    activeText: {
      type: String,
      default: 'On',
    },
    inactiveText: {
      type: String,
      default: 'Off',
    },
    ariaLabel: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // Track background color: switches between active/inactive color based on state
    const trackStyle = computed(() => ({
      backgroundColor: props.modelValue ? props.activeColor : props.inactiveColor,
    }))

    // Toggle on click: bail out when disabled
    function toggle() {
      if (props.disabled) return
      const next = !props.modelValue
      emit('update:modelValue', next)
      emit('change', next)
    }

    return () => (
      <button
        type="button"
        role="switch"
        class={[
          b(),
          v(props.size, true),
          m('checked', props.modelValue),
          m('disabled', props.disabled),
        ]}
        aria-checked={props.modelValue ? 'true' : 'false'}
        aria-label={props.ariaLabel || undefined}
        disabled={props.disabled}
        onClick={toggle}
      >
        {/* Label */}
        {props.showLabel && (
          <span class={e('label')}>
            {props.modelValue ? props.activeText : props.inactiveText}
          </span>
        )}
        {/* Track */}
        <span class={e('track')} style={trackStyle.value}>
          {/* Thumb */}
          <span class={e('thumb')} />
        </span>
      </button>
    )
  },
})