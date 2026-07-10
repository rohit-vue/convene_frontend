<template>
  <span
    ref="root"
    class="inline-flex max-w-full"
    :class="attrs.class"
    @mouseenter="onShow"
    @mouseleave="onHide"
    @focusin="onShow"
    @focusout="onHide"
  >
    <slot />
  </span>

  <Teleport to="body">
    <div
      v-if="visible && content"
      class="pointer-events-none fixed z-[300] max-w-sm rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-fg shadow-xl shadow-slate-200/80 dark:shadow-black/40"
      :style="panelStyle"
      role="tooltip"
    >
      <p class="whitespace-pre-wrap break-words">{{ content }}</p>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  content: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  maxWidth: { type: Number, default: 360 },
})

const attrs = useAttrs()
const root = ref(null)
const visible = ref(false)
const panelStyle = ref({})

let showTimer

function updatePosition() {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const margin = 8
  const width = Math.min(props.maxWidth, window.innerWidth - margin * 2)

  let left = rect.left + rect.width / 2 - width / 2
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin))

  const preferredTop = rect.bottom + 8
  const estimatedHeight = 140
  const openUpward =
    preferredTop + estimatedHeight > window.innerHeight - margin
    && rect.top > estimatedHeight + margin

  panelStyle.value = {
    left: `${left}px`,
    width: `${width}px`,
    top: openUpward ? `${rect.top - 8}px` : `${preferredTop}px`,
    transform: openUpward ? 'translateY(-100%)' : undefined,
  }
}

function onShow() {
  if (props.disabled || !props.content) return
  clearTimeout(showTimer)
  showTimer = setTimeout(() => {
    visible.value = true
    nextTick(() => updatePosition())
  }, 120)
}

function onHide() {
  clearTimeout(showTimer)
  visible.value = false
}

function onViewportChange() {
  if (!visible.value) return
  updatePosition()
}

onMounted(() => {
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
  onUnmounted(() => {
    clearTimeout(showTimer)
    window.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
  })
})
</script>
