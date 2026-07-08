<template>
  <div
    class="grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white"
    :class="[sizeClass, shapeClass, ringClass]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
    />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  src: { type: String, default: null },
  initials: { type: String, required: true },
  alt: { type: String, default: 'Profile photo' },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
  shape: {
    type: String,
    default: 'rounded',
    validator: (value) => ['rounded', 'circle'].includes(value),
  },
  ring: { type: Boolean, default: false },
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-9 w-9 text-xs'
  if (props.size === 'lg') return 'h-24 w-24 text-3xl'
  if (props.size === 'xl') return 'h-32 w-32 text-4xl'
  return 'h-12 w-12 text-sm'
})

const shapeClass = computed(() => (props.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'))

const ringClass = computed(() => {
  if (!props.ring) return ''
  if (props.size === 'sm') return 'ring-2 ring-white'
  return 'shadow-lg ring-4 ring-white'
})
</script>
