export default defineNuxtRouteMiddleware(async () => {
  const { fetchProfile, isAdmin } = useProfile()
  await fetchProfile()
  if (!isAdmin.value) return navigateTo('/')
})
