<template>
  <div class="mx-auto max-w-6xl">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-xl font-bold tracking-tight sm:text-2xl">Profile</h1>
      <p class="mt-1 text-sm text-fg-muted">Manage your personal details and how you appear in Convene.</p>
    </div>

    <div v-if="loadError" class="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
      {{ loadError }}
    </div>

    <ContentLoader v-else-if="loading" variant="profile" />

    <div v-else class="space-y-6">
      <!-- Profile card -->
      <div class="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
        <div class="grid min-h-[22rem] grid-cols-1 md:grid-cols-[minmax(280px,380px)_1fr]">
          <!-- Left: identity -->
          <div class="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 px-8 py-10 text-center dark:from-indigo-900 dark:via-indigo-800 dark:to-violet-900">
            <div class="relative w-fit">
              <ProfileAvatar
                :src="profileData?.avatar_url"
                :initials="initials"
                size="xl"
                ring
              />
              <label
                class="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-surface text-fg-muted shadow ring-1 ring-white transition hover:bg-elevated hover:text-indigo-600"
                :class="{ 'pointer-events-none opacity-60': avatarBusy }"
                title="Change photo"
              >
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="sr-only"
                  :disabled="avatarBusy"
                  @change="onAvatarSelected"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </label>
              <button
                v-if="profileData?.avatar_url && !avatarBusy"
                type="button"
                class="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-surface text-fg-muted shadow ring-1 ring-white transition hover:bg-red-50 hover:text-red-600"
                title="Remove photo"
                @click="removePhoto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p v-if="avatarBusy" class="mt-4 text-sm text-white/80">Uploading photo…</p>
            <h2 class="mt-6 text-2xl font-semibold text-white">{{ form.full_name || displayName }}</h2>
            <p v-if="form.job_title" class="mt-1.5 text-base text-white/85">{{ form.job_title }}</p>
            <span
              class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface/15 px-3.5 py-1.5 text-sm font-medium capitalize text-white ring-1 ring-white/25"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-white" />
              {{ role }} account
            </span>
          </div>

          <!-- Right: details + edit -->
          <div class="flex flex-col justify-between gap-8 px-8 py-8 sm:px-10 sm:py-10">
            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-elevated text-fg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm text-fg-subtle">Email</p>
                  <p class="mt-0.5 break-all text-base font-medium text-fg sm:text-lg">{{ profileData?.email || '—' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-elevated text-fg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                </span>
                <div>
                  <p class="text-sm text-fg-subtle">Member since</p>
                  <p class="mt-0.5 text-base font-medium text-fg sm:text-lg">{{ formatDate(displayMemberSince) }}</p>
                </div>
              </div>
              <div v-if="form.employee_code" class="flex items-center gap-4">
                <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-elevated text-fg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </span>
                <div>
                  <p class="text-sm text-fg-subtle">Employee ID</p>
                  <p class="mt-0.5 text-base font-medium text-fg sm:text-lg">{{ form.employee_code }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end border-t border-border pt-6">
              <button
                type="button"
                :disabled="editing"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-default disabled:opacity-70"
                @click="openEdit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                {{ editing ? 'Editing…' : 'Edit profile' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit form (only when editing) -->
      <div
        v-if="editing"
        class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      >
        <div class="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h2 class="text-lg font-semibold text-fg">Personal information</h2>
            <p class="mt-0.5 text-sm text-fg-muted">Update your name, employee ID, and role title.</p>
          </div>
          <button
            type="button"
            class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-elevated hover:text-fg-muted"
            title="Close"
            @click="cancelEdit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form class="space-y-5 p-6" @submit.prevent="save">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-fg">Full name</label>
            <input
              v-model="form.full_name"
              type="text"
              placeholder="Jane Doe"
              :class="inputClass"
            />
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-fg">Employee ID</label>
            <input
              v-model="form.employee_code"
              type="text"
              placeholder="e.g. EMP-1042"
              :class="inputClass"
            />
            <p class="mt-1.5 text-xs text-fg-subtle">Your company employee identifier.</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-fg">Role</label>
            <input
              v-model="form.job_title"
              type="text"
              placeholder="e.g. Web Developer, Software Developer"
              :class="inputClass"
            />
            <p class="mt-1.5 text-xs text-fg-subtle">Your job title as shown on your profile.</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-fg">Member since</label>
            <DatePicker
              v-model="form.member_since"
              placeholder="Select date"
              :input-class="inputClass"
              full-width
            />
            <p class="mt-1.5 text-xs text-fg-subtle">When you joined the team or started in this role.</p>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-fg">Email</label>
            <input
              :value="profileData?.email || ''"
              type="email"
              disabled
              class="w-full cursor-not-allowed rounded-xl border border-border bg-elevated py-2.5 px-4 text-sm text-fg-muted"
            />
            <p class="mt-1.5 text-xs text-fg-subtle">Email cannot be changed here.</p>
          </div>

          <div class="flex items-center gap-3 border-t border-border pt-5">
            <button
              type="submit"
              :disabled="saving || !dirty"
              class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
            <button
              type="button"
              class="rounded-xl px-4 py-2.5 text-sm font-medium text-fg-muted transition hover:bg-elevated"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formInputClass as inputClass } from '~/utils/ui'
const { get, update: updateProfile } = useProfileApi()
const { displayName, role, isAdmin, initials, fetchProfile } = useProfile()
const { uploadAvatar, removeAvatar } = useAvatarUpload()
const toast = useToast()

const avatarInput = ref(null)
const avatarBusy = ref(false)

const profileData = ref(null)
const loadError = ref('')
const loading = ref(true)
const saving = ref(false)
const editing = ref(false)

const form = reactive({
  full_name: '',
  employee_code: '',
  job_title: '',
  member_since: '',
})

const displayMemberSince = computed(
  () => profileData.value?.member_since || profileData.value?.created_at || null,
)

const snapshot = ref('')

function serializeForm() {
  return JSON.stringify({
    full_name: form.full_name.trim(),
    employee_code: form.employee_code.trim(),
    job_title: form.job_title.trim(),
    member_since: form.member_since || '',
  })
}

const dirty = computed(() => profileData.value && serializeForm() !== snapshot.value)

function resetForm() {
  if (!profileData.value) return
  form.full_name = profileData.value.full_name || ''
  form.employee_code = profileData.value.employee_code || ''
  form.job_title = profileData.value.job_title || ''
  form.member_since = profileData.value.member_since || ''
  snapshot.value = serializeForm()
}

function openEdit() {
  resetForm()
  editing.value = true
}

function cancelEdit() {
  resetForm()
  editing.value = false
}

async function save() {
  saving.value = true

  try {
    await updateProfile({
      full_name: form.full_name.trim(),
      employee_code: form.employee_code.trim(),
      job_title: form.job_title.trim(),
      member_since: form.member_since || null,
    })
    await loadProfile({ quiet: true })
    await fetchProfile()
    editing.value = false
    toast.success('Profile updated successfully.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to save profile.'))
  } finally {
    saving.value = false
  }
}

async function loadProfile({ quiet = false } = {}) {
  if (!quiet) {
    loading.value = true
    loadError.value = ''
  }
  try {
    profileData.value = await get()
    resetForm()
  } catch (e) {
    loadError.value = toastErrorMessage(e, 'Failed to load profile.')
    toast.error(loadError.value)
  } finally {
    if (!quiet) loading.value = false
  }
}

async function onAvatarSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  avatarBusy.value = true

  try {
    const avatarUrl = await uploadAvatar(file)
    if (profileData.value) profileData.value.avatar_url = avatarUrl
    await fetchProfile()
    toast.success('Profile photo updated.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to upload photo.'))
  } finally {
    avatarBusy.value = false
  }
}

async function removePhoto() {
  avatarBusy.value = true

  try {
    await removeAvatar()
    if (profileData.value) profileData.value.avatar_url = null
    await fetchProfile()
    toast.success('Profile photo removed.')
  } catch (e) {
    toast.error(toastErrorMessage(e, 'Failed to remove photo.'))
  } finally {
    avatarBusy.value = false
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
