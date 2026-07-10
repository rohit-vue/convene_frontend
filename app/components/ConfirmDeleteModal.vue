<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
      @click.self="close"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-surface shadow-xl"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div class="px-6 pt-6">
          <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </div>

          <h2 :id="titleId" class="mt-4 text-center text-lg font-semibold text-fg">
            {{ title }}
          </h2>
          <p class="mt-2 text-center text-sm text-fg-muted">
            {{ message }}
          </p>

          <div v-if="$slots.default" class="mt-5">
            <slot />
          </div>

          <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>
        </div>

        <div class="mt-6 flex gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            class="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-fg-muted transition hover:bg-elevated disabled:opacity-50"
            :disabled="loading"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
            :disabled="loading"
            @click="confirm"
          >
            {{ loading ? 'Deleting…' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    loading?: boolean
    error?: string
  }>(),
  {
    title: 'Delete this item?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    loading: false,
    error: '',
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const titleId = `confirm-delete-title-${Math.random().toString(36).slice(2, 9)}`

function close() {
  if (props.loading) return
  emit('close')
}

function confirm() {
  emit('confirm')
}
</script>
