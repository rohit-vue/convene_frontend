export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { fetchProfile, isAdmin, profile } = useProfile()
  await fetchProfile()
  // Only redirect when we know the role; avoid bouncing admins if profile is still loading
  if (user.value && profile.value && !isAdmin.value) {
    return navigateTo('/')
  }
})
