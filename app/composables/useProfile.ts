interface Profile {
  full_name: string | null
  role: 'employee' | 'admin'
}

export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('profile', () => null)

  async function fetchProfile() {
    if (!user.value) {
      profile.value = null
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.value.id)
      .single()
    profile.value = (data as Profile) ?? null
  }

  const isAdmin = computed(() => profile.value?.role === 'admin')

  return { profile, isAdmin, fetchProfile }
}
