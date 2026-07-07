<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 class="text-lg font-semibold text-slate-800">Assign Meeting</h2>
        <button
          class="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form class="space-y-5 px-6 py-5" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Assign to <span class="text-red-500">*</span></label>
          <AppSelect
            v-model="form.employee_id"
            :options="employeeSelectOptions"
            placeholder="Select employee…"
            :input-class="inputClass"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Project Title <span class="text-red-500">*</span></label>
          <input v-model="form.project_name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Client Name <span class="text-red-500">*</span></label>
          <input v-model="form.client_name" required type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Upwork Account</label>
          <AppSelect
            v-model="form.upwork_account"
            :options="upworkSelectOptions"
            placeholder="Select…"
            :input-class="inputClass"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">Upwork Link</label>
          <input v-model="form.link_url" type="url" placeholder="https://www.upwork.com/…" :class="inputClass" />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Date <span class="text-red-500">*</span></label>
            <input v-model="form.date" required type="date" :class="inputClass" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">Time <span class="text-red-500">*</span></label>
            <input v-model="form.time" required type="time" :class="inputClass" />
          </div>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100" @click="close">
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Assigning…' : 'Assign Meeting' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'saved'])

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const { assign } = useMeetings()
const { getOptions } = useEmployees()

const { data: employees } = await useAsyncData(
  'employees-for-assign',
  () => getOptions(),
  { server: false, default: () => [] },
)

const employeeSelectOptions = computed(() =>
  (employees.value || []).map((emp) => ({ value: emp.id, label: emp.name })),
)

const upworkSelectOptions = computed(() => upworkAccountOptions)

const loading = ref(false)
const error = ref('')

function blankForm() {
  return {
    employee_id: '',
    project_name: '',
    client_name: '',
    upwork_account: '',
    link_url: '',
    date: '',
    time: '',
  }
}

const form = reactive(blankForm())

function close() {
  emit('close')
}

function combineDateTime(date, time) {
  return new Date(`${date}T${time}`).toISOString()
}

async function save() {
  if (!form.employee_id || !form.project_name || !form.client_name || !form.date || !form.time) {
    error.value = 'Please fill in all required (*) fields.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await assign({
      employee_id: form.employee_id,
      project_name: form.project_name,
      client_name: form.client_name,
      upwork_account: form.upwork_account || undefined,
      link_url: form.link_url || undefined,
      meeting_at: combineDateTime(form.date, form.time),
    })
    Object.assign(form, blankForm())
    emit('saved')
  } catch (e) {
    error.value = e?.data?.error || e?.message || 'Failed to assign meeting.'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      Object.assign(form, blankForm())
      error.value = ''
    }
  },
)
</script>
