<template>
  <div ref="root" class="relative">
    <button
      class="relative grid h-9 w-9 place-items-center rounded-full bg-elevated text-fg-muted transition hover:bg-border hover:text-fg"
      @click.stop="togglePanel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
      <span
        v-if="unread > 0"
        class="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
      >
        {{ unread > 9 ? '9+' : unread }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
    >
      <div class="border-b border-border px-4 py-3">
        <h3 class="text-sm font-semibold text-fg">Notifications</h3>
      </div>
      <ul v-if="notifications?.length" class="max-h-80 overflow-y-auto">
        <li
          v-for="n in notifications"
          :key="n.id"
          class="border-b border-border px-4 py-3 transition hover:bg-elevated"
          :class="{ 'bg-indigo-50/50 dark:bg-indigo-950/40': !n.read_at }"
        >
          <p class="text-sm font-medium text-fg">{{ n.title }}</p>
          <p v-if="n.body" class="mt-0.5 text-xs text-fg-muted">{{ n.body }}</p>
          <p class="mt-1 text-xs text-fg-subtle">{{ formatTime(n.created_at) }}</p>
          <button
            v-if="(n.meeting_id || n.project_id) && !n.read_at"
            class="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300"
            @click="goToDashboard"
          >
            View on dashboard →
          </button>
        </li>
      </ul>
      <p v-else class="px-4 py-8 text-center text-sm text-fg-subtle">No notifications yet.</p>
    </div>
  </div>
</template>

<script setup>
const { list, unreadCount } = useNotifications()

const root = ref(null)
const open = ref(false)
const { openExclusive, closeExclusive } = useExclusiveDropdown()

const { data: notifications, refresh: refreshList } = await useAsyncData(
  'notifications',
  () => list(),
  { server: false, default: () => [] },
)

const { data: unreadData, refresh: refreshUnread } = await useAsyncData(
  'notifications-unread',
  () => unreadCount(),
  { server: false, default: () => ({ count: 0 }) },
)

const unread = computed(() => unreadData.value?.count ?? 0)

function close() {
  if (!open.value) return
  open.value = false
  closeExclusive(close)
}

function togglePanel() {
  if (open.value) {
    close()
    return
  }
  openExclusive(close)
  open.value = true
  refreshList()
  refreshUnread()
}

function goToDashboard() {
  close()
  navigateTo('/')
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

onMounted(() => {
  const onClickOutside = (e) => {
    if (!open.value || !root.value) return
    if (!root.value.contains(e.target)) close()
  }
  document.addEventListener('click', onClickOutside)
  onUnmounted(() => {
    closeExclusive(close)
    document.removeEventListener('click', onClickOutside)
  })
})
</script>
