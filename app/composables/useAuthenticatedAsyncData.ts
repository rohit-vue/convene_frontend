/**
 * Like useAsyncData, but ensures a Supabase session exists before fetching
 * and refetches when the user becomes available after a full page reload.
 */
export function useAuthenticatedAsyncData<T>(
  key: string,
  handler: () => Promise<T>,
  options: Record<string, unknown> = {},
) {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const { watch: extraWatch, server = false, default: defaultValue, ...rest } = options

  const watchSources = Array.isArray(extraWatch)
    ? [user, ...extraWatch]
    : extraWatch
      ? [user, extraWatch]
      : [user]

  return useAsyncData(
    key,
    async () => {
      if (!user.value?.id) {
        const { data } = await supabase.auth.getSession()
        if (!data.session?.access_token) {
          return typeof defaultValue === 'function'
            ? (defaultValue as () => T)()
            : (null as T)
        }
      }
      return handler()
    },
    {
      server,
      default: defaultValue,
      watch: watchSources,
      ...rest,
    } as any,
  )
}
