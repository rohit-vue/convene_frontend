interface Profile {
  full_name: string | null
  role: 'employee' | 'admin'
}

export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('profile', () => null)

  async function fetchProfile() {
    const id = user.value?.id
    if (!id) {
      profile.value = null
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', id)
      .single()
    profile.value = data ? (data as Profile) : null
  }

  // Prefer the profile row, then the name captured at signup, before any fallback.
  const fullName = computed(
    () =>
      profile.value?.full_name ||
      (user.value?.user_metadata?.full_name as string | undefined) ||
      null,
  )

  const displayName = computed(() => fullName.value || user.value?.email || 'User')

  const role = computed(() => profile.value?.role ?? 'employee')

  const isAdmin = computed(() => role.value === 'admin')

  const initials = computed(() => {
    const source = fullName.value || user.value?.email || 'U'
    return source
      .split(/[\s@.]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

  return { profile, fullName, displayName, role, isAdmin, initials, fetchProfile }
}
