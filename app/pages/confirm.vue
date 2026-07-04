<template>
  <div class="text-center">
    <h1 class="text-xl font-bold tracking-tight">Confirming your account…</h1>
    <p class="mt-2 text-sm text-slate-500">Please wait, you'll be redirected shortly.</p>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'auth' })

const user = useSupabaseUser()

// Once Supabase establishes the session from the callback, send the user in.
watch(
  user,
  (value) => {
    if (value) {
      navigateTo('/')
    }
  },
  { immediate: true },
)
</script>
