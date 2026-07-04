<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight">Profile</h1>
      <p class="mt-1 text-sm text-slate-500">Your account details.</p>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div class="h-24 bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div class="px-6 pb-6">
        <div class="-mt-10 flex items-end gap-4">
          <div class="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white ring-4 ring-white">
            {{ initials }}
          </div>
          <div class="pb-1">
            <h2 class="text-xl font-semibold text-slate-800">{{ displayName }}</h2>
            <span class="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700">
              {{ role }}
            </span>
          </div>
        </div>

        <dl class="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Full name</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ fullName || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Email</dt>
            <dd class="mt-1 break-all text-sm text-slate-800">{{ user?.email || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Role</dt>
            <dd class="mt-1 text-sm capitalize text-slate-800">{{ role }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Member since</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatDate(user?.created_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">Last sign in</dt>
            <dd class="mt-1 text-sm text-slate-800">{{ formatDate(user?.last_sign_in_at) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-400">User ID</dt>
            <dd class="mt-1 truncate font-mono text-xs text-slate-500">{{ user?.id || '—' }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const { fullName, displayName, role, initials, fetchProfile } = useProfile()

onMounted(fetchProfile)
watch(user, fetchProfile)

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>
