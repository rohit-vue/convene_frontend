<template>
  <div ref="root" class="relative w-72 max-w-full">
    <span class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    </span>
    <input
      v-model="query"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      @focus="onFocus"
      @keydown.escape="close"
      @keydown.down.prevent="moveHighlight(1)"
      @keydown.up.prevent="moveHighlight(-1)"
      @keydown.enter.prevent="selectHighlighted"
    />

    <div
      v-if="open && (loading || hasResults || searched)"
      class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div v-if="loading" class="px-4 py-3 text-sm text-slate-500">Searching…</div>

      <div v-else-if="!hasResults" class="px-4 py-3 text-sm text-slate-500">
        No results for “{{ query.trim() }}”
      </div>

      <div v-else class="max-h-80 overflow-y-auto py-1">
        <template v-if="results.meetings.length">
          <p class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Meetings</p>
          <button
            v-for="(item, i) in results.meetings"
            :key="`m-${item.id}`"
            type="button"
            class="flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition hover:bg-slate-50"
            :class="highlightIndex === flatIndex('meetings', i) ? 'bg-indigo-50' : ''"
            @mouseenter="highlightIndex = flatIndex('meetings', i)"
            @click="goTo(item)"
          >
            <span class="mt-0.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-slate-800">{{ item.project_name }}</span>
              <span class="block truncate text-xs text-slate-500">
                {{ item.client_name || 'No client' }}
                <template v-if="item.employee_name"> · {{ item.employee_name }}</template>
              </span>
            </span>
          </button>
        </template>

        <template v-if="results.projects.length">
          <p class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Projects</p>
          <button
            v-for="(item, i) in results.projects"
            :key="`p-${item.id}`"
            type="button"
            class="flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition hover:bg-slate-50"
            :class="highlightIndex === flatIndex('projects', i) ? 'bg-indigo-50' : ''"
            @mouseenter="highlightIndex = flatIndex('projects', i)"
            @click="goTo(item)"
          >
            <span class="mt-0.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-slate-800">{{ item.name }}</span>
              <span class="block truncate text-xs capitalize text-slate-500">
                {{ item.client_name || 'No client' }}
                <template v-if="item.status"> · {{ item.status.replace(/_/g, ' ') }}</template>
              </span>
            </span>
          </button>
        </template>

        <template v-if="isAdmin && results.employees.length">
          <p class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Employees</p>
          <button
            v-for="(item, i) in results.employees"
            :key="`e-${item.id}`"
            type="button"
            class="flex w-full items-start gap-3 px-3 py-2 text-left text-sm transition hover:bg-slate-50"
            :class="highlightIndex === flatIndex('employees', i) ? 'bg-indigo-50' : ''"
            @mouseenter="highlightIndex = flatIndex('employees', i)"
            @click="goTo(item)"
          >
            <span class="mt-0.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-medium text-slate-800">{{ item.name }}</span>
              <span v-if="item.email" class="block truncate text-xs text-slate-500">{{ item.email }}</span>
            </span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
const { search } = useSearch()
const { isAdmin } = useProfile()

const root = ref(null)
const query = ref('')
const open = ref(false)
const loading = ref(false)
const searched = ref(false)
const highlightIndex = ref(-1)

const results = ref({
  meetings: [],
  projects: [],
  employees: [],
})

const placeholder = computed(() =>
  isAdmin.value
    ? 'Search meetings, projects, employees…'
    : 'Search meetings, projects…',
)

const hasResults = computed(() =>
  results.value.meetings.length > 0
  || results.value.projects.length > 0
  || results.value.employees.length > 0,
)

const flatItems = computed(() => [
  ...results.value.meetings.map((item) => ({ kind: 'meeting', item })),
  ...results.value.projects.map((item) => ({ kind: 'project', item })),
  ...(isAdmin.value
    ? results.value.employees.map((item) => ({ kind: 'employee', item }))
    : []),
])

let debounceTimer

watch(query, (value) => {
  clearTimeout(debounceTimer)
  highlightIndex.value = -1

  const term = value.trim()
  if (term.length < 2) {
    results.value = { meetings: [], projects: [], employees: [] }
    searched.value = false
    open.value = false
    return
  }

  debounceTimer = setTimeout(() => runSearch(term), 300)
})

async function runSearch(term) {
  loading.value = true
  open.value = true
  searched.value = false

  try {
    results.value = await search(term)
    searched.value = true
    highlightIndex.value = flatItems.value.length ? 0 : -1
  } catch {
    results.value = { meetings: [], projects: [], employees: [] }
    searched.value = true
  } finally {
    loading.value = false
  }
}

function flatIndex(section, index) {
  if (section === 'meetings') return index
  if (section === 'projects') return results.value.meetings.length + index
  return results.value.meetings.length + results.value.projects.length + index
}

function onFocus() {
  if (query.value.trim().length >= 2) open.value = true
}

function close() {
  open.value = false
  highlightIndex.value = -1
}

function moveHighlight(delta) {
  const count = flatItems.value.length
  if (!count) return
  if (highlightIndex.value < 0) {
    highlightIndex.value = 0
    return
  }
  highlightIndex.value = (highlightIndex.value + delta + count) % count
}

function selectHighlighted() {
  const entry = flatItems.value[highlightIndex.value]
  if (entry) goTo(entry.item)
}

function meetingPath(m) {
  const employeeId = m.employee_id || m.created_by
  if (isAdmin.value && employeeId) {
    return `/employees/${employeeId}/meetings/${m.id}?from=meetings`
  }
  return `/meetings/${m.id}`
}

function projectPath(p) {
  const employeeId = p.assigned_to || p.created_by
  if (isAdmin.value && employeeId) {
    return `/employees/${employeeId}/projects/${p.id}?from=projects`
  }
  return `/projects/${p.id}`
}

function goTo(item) {
  let path
  if ('project_name' in item) path = meetingPath(item)
  else if ('name' in item && !('email' in item)) path = projectPath(item)
  else path = `/employees/${item.id}`

  close()
  query.value = ''
  navigateTo(path)
}

function onDocumentClick(event) {
  if (!root.value?.contains(event.target)) close()
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('click', onDocumentClick)
})
</script>
