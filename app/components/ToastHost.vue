<template>
  <div
    class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
    aria-live="polite"
    aria-relevant="additions"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm shadow-lg backdrop-blur"
        :class="toastClass(toast.type)"
        role="status"
      >
        <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center" v-html="toastIcon(toast.type)" />
        <p class="min-w-0 flex-1 leading-snug">{{ toast.message }}</p>
        <button
          type="button"
          class="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss"
          @click="dismiss(toast.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
const { toasts, dismiss } = useToast()

function toastClass(type) {
  if (type === 'success') return 'border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/95 dark:text-emerald-200'
  if (type === 'error') return 'border-red-200 bg-red-50/95 text-red-900 dark:border-red-800 dark:bg-red-950/95 dark:text-red-200'
  return 'border-border bg-surface/95 text-fg'
}

function toastIcon(type) {
  if (type === 'success') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>'
  }
  if (type === 'error') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>'
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.22s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
.toast-move {
  transition: transform 0.22s ease;
}
</style>
