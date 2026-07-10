<template>
  <button
    type="button"
    class="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-fg transition hover:bg-elevated"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-busy="!ready"
    @click="toggle"
  >
    <span class="flex items-center gap-3">
      <!-- Stable placeholder until mounted so SSR HTML matches first client paint -->
      <span v-if="!ready" class="inline-block h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <svg
        v-else-if="isDark"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-fg-muted"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-fg-muted"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      {{ ready ? (isDark ? 'Light mode' : 'Dark mode') : 'Theme' }}
    </span>
    <span
      class="flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200"
      :class="ready && isDark ? 'justify-end bg-indigo-500' : 'justify-start bg-border'"
    >
      <span class="h-4 w-4 rounded-full bg-white shadow-md" />
    </span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const ready = ref(false)

onMounted(() => {
  ready.value = true
})

const isDark = computed(() => colorMode.value === 'dark')

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
