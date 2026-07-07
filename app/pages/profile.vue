<template>
  <div class="mx-auto max-w-5xl">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Profile</h1>
      <p class="mt-1 text-sm text-slate-500">Manage your personal details and how you appear in Convene.</p>
    </div>

    <div v-if="loadError" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      {{ loadError }}
    </div>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
      <!-- Sidebar card -->
      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:sticky lg:top-24 lg:self-start">
        <div class="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-6 pb-10 pt-8 text-center">
          <div class="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl font-bold text-white shadow-lg ring-4 ring-white">
            {{ initials }}
          </div>
        </div>

        <div class="px-6 pb-6 pt-4 text-center">
          <h2 class="text-lg font-semibold text-slate-800">{{ form.full_name || displayName }}</h2>
          <p v-if="form.job_title" class="mt-0.5 text-sm text-slate-500">{{ form.job_title }}</p>
          <span
            class="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize"
            :class="isAdmin ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="isAdmin ? 'bg-violet-500' : 'bg-emerald-500'" />
            {{ role }} account
          </span>

          <div class="mt-6 space-y-3 border-t border-slate-100 pt-6 text-left">
            <div class="flex items-center gap-3 text-sm">
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-slate-400">Email</p>
                <p class="break-all text-sm font-medium text-slate-700">{{ profileData?.email || '—' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </span>
              <div>
                <p class="text-xs text-slate-400">Member since</p>
                <p class="font-medium text-slate-700">{{ formatDate(profileData?.created_at) }}</p>
              </div>
            </div>
            <div v-if="form.employee_code" class="flex items-center gap-3 text-sm">
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </span>
              <div>
                <p class="text-xs text-slate-400">Employee ID</p>
                <p class="font-medium text-slate-700">{{ form.employee_code }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit form -->
      <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-6 py-5">
          <h2 class="text-lg font-semibold text-slate-800">Personal information</h2>
          <p class="mt-0.5 text-sm text-slate-500">Update your name, employee ID, and role title.</p>
        </div>

        <form class="space-y-5 p-6" @submit.prevent="save">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
            <input
              v-model="form.full_name"
              type="text"
              placeholder="Jane Doe"
              :class="inputClass"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Employee ID</label>
            <input
              v-model="form.employee_code"
              type="text"
              placeholder="e.g. EMP-1042"
              :class="inputClass"
            />
            <p class="mt-1.5 text-xs text-slate-400">Your company employee identifier.</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
            <input
              v-model="form.job_title"
              type="text"
              placeholder="e.g. Web Developer, Software Developer"
              :class="inputClass"
            />
            <p class="mt-1.5 text-xs text-slate-400">Your job title as shown on your profile.</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <input
              :value="profileData?.email || ''"
              type="email"
              disabled
              class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-4 text-sm text-slate-500"
            />
            <p class="mt-1.5 text-xs text-slate-400">Email cannot be changed here.</p>
          </div>

          <p v-if="saveError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ saveError }}</p>
          <p v-if="saved" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Profile updated successfully.
          </p>

          <div class="flex items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              :disabled="saving || !dirty"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
            <button
              v-if="dirty"
              type="button"
              class="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              @click="resetForm"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const { get, update: updateProfile } = useProfileApi()
const { displayName, role, isAdmin, initials, fetchProfile } = useProfile()

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'

const profileData = ref(null)
const loadError = ref('')
const saveError = ref('')
const saved = ref(false)
const saving = ref(false)

const form = reactive({
  full_name: '',
  employee_code: '',
  job_title: '',
})

const snapshot = ref('')

function serializeForm() {
  return JSON.stringify({
    full_name: form.full_name.trim(),
    employee_code: form.employee_code.trim(),
    job_title: form.job_title.trim(),
  })
}

const dirty = computed(() => profileData.value && serializeForm() !== snapshot.value)

function resetForm() {
  if (!profileData.value) return
  form.full_name = profileData.value.full_name || ''
  form.employee_code = profileData.value.employee_code || ''
  form.job_title = profileData.value.job_title || ''
  snapshot.value = serializeForm()
  saveError.value = ''
  saved.value = false
}

async function loadProfile() {
  loadError.value = ''
  try {
    profileData.value = await get()
    resetForm()
  } catch (e) {
    loadError.value = e?.data?.error || e?.message || 'Failed to load profile.'
  }
}

async function save() {
  saving.value = true
  saveError.value = ''
  saved.value = false

  try {
    await updateProfile({
      full_name: form.full_name.trim(),
      employee_code: form.employee_code.trim(),
      job_title: form.job_title.trim(),
    })
    await loadProfile()
    await fetchProfile()
    saved.value = true
  } catch (e) {
    saveError.value = e?.data?.error || e?.message || 'Failed to save profile.'
  } finally {
    saving.value = false
  }
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(loadProfile)
</script>
