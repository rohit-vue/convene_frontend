<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-fg">Create your account</h1>
    <p class="mt-1.5 text-sm text-fg-muted">Start running better client meetings with Convene.</p>

    <div v-if="emailSent" class="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
      <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      </div>
      <h2 class="mt-4 text-base font-semibold text-emerald-900">Check your inbox</h2>
      <p class="mt-1 text-sm text-emerald-700">
        We've sent a confirmation link to <strong>{{ email }}</strong>. Confirm your email to activate your account, then
        <NuxtLink to="/login" class="font-medium underline">sign in</NuxtLink>.
      </p>
    </div>

    <form v-else class="mt-8 space-y-4" @submit.prevent="signup">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-fg">Full name</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <input
            v-model="fullName"
            type="text"
            required
            placeholder="Jane Doe"
            class="w-full rounded-xl border border-border bg-elevated py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-surface focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
          />
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-fg">Email</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </span>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@company.com"
            class="w-full rounded-xl border border-border bg-elevated py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-surface focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
          />
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-fg">Password</label>
        <div class="relative">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="6"
            placeholder="At least 6 characters"
            class="w-full rounded-xl border border-border bg-elevated py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-400 focus:bg-surface focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-fg-subtle transition hover:text-fg-muted"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <p class="mt-1.5 text-xs text-fg-subtle">Use at least 6 characters.</p>
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {{ loading ? 'Creating account…' : 'Create account' }}
      </button>

      <p class="text-center text-xs text-fg-subtle">
        By signing up you'll join as an employee. Admin access is granted by your workspace owner.
      </p>
    </form>

    <p v-if="!emailSent" class="mt-6 text-center text-sm text-fg-muted">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const toast = useToast()
const fullName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const emailSent = ref(false)
const showPassword = ref(false)

async function signup() {
  loading.value = true
  error.value = ''

  // The DB trigger assigns the 'employee' role automatically.
  const { data, error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { full_name: fullName.value },
    },
  })
  loading.value = false

  if (err) {
    error.value = err.message
    toast.error(err.message)
    return
  }

  // If email confirmation is disabled, a session is returned and the user is logged in.
  if (data.session) {
    toast.success('Account created.')
    await navigateTo('/')
  } else {
    // Email confirmation is enabled: prompt the user to check their inbox.
    emailSent.value = true
    toast.success('Confirmation email sent.')
  }
}
</script>
