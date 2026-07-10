/**
 * Client: restore profile after mount if the server payload had no profile.
 * Must not run before hydration or role/avatar DOM will mismatch SSR HTML.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const user = useSupabaseUser()
  const { profile, fetchProfile } = useProfile()

  const ensureProfile = () => {
    if (user.value?.id && !profile.value) {
      void fetchProfile()
    }
  }

  nuxtApp.hook('app:mounted', () => {
    ensureProfile()
    watch(user, ensureProfile)
  })
})
