export const useApi = () => {
  const supabase = useSupabaseClient()
  const { public: { apiBase } } = useRuntimeConfig()

  async function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    return await $fetch<T>(`${apiBase}${path}`, {
      ...options,
      headers: {
        ...(options?.headers as Record<string, string>),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  return { apiFetch }
}
