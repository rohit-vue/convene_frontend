<template>
  <DatePicker
    :model-value="modelValue"
    :marked-dates="markedDates"
    :placeholder="placeholder"
    :input-class="inputClass"
    allow-clear
    show-marked-legend
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  markedDates: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'All dates' },
  inputClass: {
    type: String,
    default:
      'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
  },
})

const emit = defineEmits(['update:modelValue'])
</script>
