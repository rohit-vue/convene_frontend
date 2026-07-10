<template>
  <div
    v-if="open"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
    @click.self="close"
  >
    <div class="my-8 w-full max-w-lg rounded-2xl bg-surface shadow-xl">
      <div class="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 class="text-lg font-semibold text-fg">Assign Project</h2>
        <button
          class="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted"
          @click="close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <form class="space-y-5 px-6 py-5" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Assign to <span class="text-red-500">*</span></label>
          <AppSelect
            v-model="form.employee_id"
            :options="employeeSelectOptions"
            placeholder="Select employee…"
            :input-class="inputClass"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Project name <span class="text-red-500">*</span></label>
          <input v-model="form.name" required type="text" placeholder="e.g. Website Redesign" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Client name <span class="text-red-500">*</span></label>
          <input v-model="form.client_name" required type="text" placeholder="e.g. Acme Corp" :class="inputClass" />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Start date</label>
          <DatePicker
            v-model="form.start_date"
            placeholder="Select date"
            :input-class="inputClass"
            full-width
          />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Job category</label>
            <AppSelect
              v-model="form.job_category"
              :options="jobCategoryOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-fg">Job type</label>
            <AppSelect
              v-model="form.job_type"
              :options="jobTypeOptions"
              placeholder="Select…"
              :input-class="inputClass"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Upwork account</label>
          <AppSelect
            v-model="form.upwork_account"
            :options="upworkSelectOptions"
            placeholder="Select…"
            :input-class="inputClass"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-fg">Upwork link</label>
          <input v-model="form.link_url" type="url" placeholder="https://www.upwork.com/…" :class="inputClass" />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-fg-muted hover:bg-elevated" @click="close">
            Cancel
          </button>
          <button
            type="submit"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
            :disabled="loading"
          >
            {{ loading ? 'Assigning…' : 'Assign Project' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { formInputClass as inputClass } from '~/utils/ui'
const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'saved'])

const { assign } = useProjects()
const { getOptions } = useEmployees()

const { data: employees } = await useAsyncData(
  'employees-for-project-assign',
  () => getOptions(),
  { server: false, default: () => [] },
)

const employeeSelectOptions = computed(() =>
  (employees.value || []).map((emp) => ({ value: emp.id, label: emp.name })),
)

const upworkSelectOptions = computed(() => upworkAccountOptions)

const loading = ref(false)
const error = ref('')
const toast = useToast()

function blankForm() {
  return {
    employee_id: '',
    name: '',
    client_name: '',
    start_date: '',
    job_category: '',
    job_type: '',
    upwork_account: '',
    link_url: '',
  }
}

const form = reactive(blankForm())

function close() {
  emit('close')
}

async function save() {
  if (!form.employee_id || !form.name.trim() || !form.client_name.trim()) {
    error.value = 'Please fill in all required (*) fields.'
    toast.error(error.value)
    return
  }

  loading.value = true
  error.value = ''
  try {
    await assign({
      employee_id: form.employee_id,
      name: form.name.trim(),
      client_name: form.client_name.trim(),
      start_date: form.start_date || undefined,
      job_category: form.job_category || undefined,
      job_type: form.job_type || undefined,
      upwork_account: form.upwork_account || undefined,
      link_url: form.link_url || undefined,
    })
    Object.assign(form, blankForm())
    toast.success('Project assigned.')
    emit('saved')
  } catch (e) {
    error.value = toastErrorMessage(e, 'Failed to assign project.')
    toast.error(error.value)
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
