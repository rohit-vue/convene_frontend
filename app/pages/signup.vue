<template>
  <div>
    <h1 class="text-xl font-bold tracking-tight">Create your account</h1>
    <p class="mt-1 text-sm text-slate-500">Sign up to get started with Convene.</p>

    <div v-if="emailSent" class="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      Almost there! We've sent a confirmation link to <strong>{{ email }}</strong>.
      Please check your inbox to activate your account, then
      <NuxtLink to="/login" class="font-medium underline">sign in</NuxtLink>.
    </div>

    <form v-else class="mt-6 space-y-4" @submit.prevent="signup">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Full name</label>
        <input
          v-model="fullName"
          type="text"
          required
          placeholder="Jane Doe"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="you@example.com"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="6"
          placeholder="At least 6 characters"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {{ loading ? 'Creating account…' : 'Sign up' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-700">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const supabase = useSupabaseClient()
const fullName = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const emailSent = ref(false)

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
    return
  }

  // If email confirmation is disabled, a session is returned and the user is logged in.
  if (data.session) {
    await navigateTo('/')
  } else {
    // Email confirmation is enabled: prompt the user to check their inbox.
    emailSent.value = true
  }
}
</script>
