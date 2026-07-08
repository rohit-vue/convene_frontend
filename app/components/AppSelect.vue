<template>
  <div ref="root" class="relative" :class="fullWidth ? 'w-full' : ''">
    <button
      ref="trigger"
      type="button"
      :disabled="disabled"
      :class="[
        inputClass,
        fullWidth ? 'w-full' : 'w-full min-w-0 sm:w-auto sm:min-w-[10.5rem]',
        'flex items-center justify-between gap-2 text-left',
        disabled ? 'cursor-not-allowed opacity-60' : '',
        open ? 'border-indigo-500 ring-2 ring-indigo-500/20' : '',
      ]"
      @click.stop="toggle"
    >
      <span class="truncate" :class="displayLabel ? 'text-slate-700' : 'text-slate-400'">
        {{ displayLabel || placeholder }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="shrink-0 text-slate-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="panel"
        class="fixed z-[200] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
        :style="panelStyle"
        @click.stop
      >
        <ul class="max-h-60 overflow-y-auto p-1">
          <li v-for="opt in options" :key="opt.value || '__empty__'">
            <button
              type="button"
              :disabled="opt.disabled"
              class="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition"
              :class="optionClass(opt)"
              @click="select(opt)"
            >
              <span class="truncate">{{ opt.label }}</span>
              <svg
                v-if="opt.value === modelValue"
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="shrink-0"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Select…',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
  inputClass: {
    type: String,
    default:
      'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
  },
})

const emit = defineEmits(['update:modelValue'])

const { openExclusive, closeExclusive } = useExclusiveDropdown()

const root = ref(null)
const trigger = ref(null)
const panel = ref(null)
const open = ref(false)
const panelStyle = ref({})

const displayLabel = computed(() => {
  const match = props.options.find((opt) => opt.value === props.modelValue)
  return match?.label || ''
})

function optionClass(opt) {
  if (opt.disabled) {
    return 'cursor-not-allowed text-slate-300'
  }
  if (opt.value === props.modelValue) {
    return 'bg-indigo-600 font-medium text-white'
  }
  return 'text-slate-700 hover:bg-slate-100'
}

function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const maxHeight = 240
  const spaceBelow = window.innerHeight - rect.bottom - 8
  const spaceAbove = rect.top - 8
  const openUpward = spaceBelow < maxHeight && spaceAbove > spaceBelow

  panelStyle.value = {
    left: `${rect.left}px`,
    top: openUpward ? `${rect.top - 4}px` : `${rect.bottom + 4}px`,
    minWidth: `${rect.width}px`,
    width: `${rect.width}px`,
    transform: openUpward ? 'translateY(-100%)' : undefined,
  }
}

function close() {
  if (!open.value) return
  open.value = false
  closeExclusive(close)
}

function toggle() {
  if (props.disabled) return
  if (open.value) {
    close()
    return
  }
  openExclusive(close)
  open.value = true
  nextTick(() => updatePosition())
}

function select(opt) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  close()
}

function onDocumentClick(e) {
  if (!open.value) return
  if (root.value?.contains(e.target) || panel.value?.contains(e.target)) return
  close()
}

function onViewportChange() {
  if (!open.value) return
  updatePosition()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  onUnmounted(() => {
    closeExclusive(close)
    document.removeEventListener('click', onDocumentClick)
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  })
})
</script>
