/**
 * Load profile once before app/layout render so SSR HTML and client
 * hydration share the same role/avatar state (via useState payload).
 */
export default defineNuxtPlugin(async () => {
  const user = useSupabaseUser()
  if (!user.value?.id) return

  const { profile, fetchProfile } = useProfile()
  if (!profile.value) {
    await fetchProfile()
  }
})
