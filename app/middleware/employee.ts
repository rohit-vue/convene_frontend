export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const { fetchProfile, isEmployee, profile } = useProfile()
  await fetchProfile()
  if (user.value && profile.value && !isEmployee.value) {
    return navigateTo('/')
  }
})
