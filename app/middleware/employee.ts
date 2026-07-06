export default defineNuxtRouteMiddleware(async () => {
  const { fetchProfile, isEmployee } = useProfile()
  await fetchProfile()
  if (!isEmployee.value) return navigateTo('/')
})
