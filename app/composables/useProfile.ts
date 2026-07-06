interface Profile {
  full_name: string | null
  role: 'employee' | 'admin'
  employee_code: string | null
  job_title: string | null
}

interface AuthUserSnapshot {
  id: string
  email?: string
  user_metadata?: { full_name?: string }
}

export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const profile = useState<Profile | null>('profile', () => null)
  const authUser = useState<AuthUserSnapshot | null>('authUser', () => null)

  async function resolveAuthUser(): Promise<AuthUserSnapshot | null> {
    if (user.value?.id) return user.value as unknown as AuthUserSnapshot

    const { data } = await supabase.auth.getSession()
    const sessionUser = data.session?.user
    if (sessionUser?.id) return sessionUser as unknown as AuthUserSnapshot

    return null
  }

  async function fetchProfile() {
    const resolvedUser = await resolveAuthUser()
    if (!resolvedUser?.id) {
      profile.value = null
      authUser.value = null
      return
    }

    authUser.value = resolvedUser

    const { data } = await supabase
      .from('profiles')
      .select('full_name, role, employee_code, job_title')
      .eq('id', resolvedUser.id)
      .single()

    profile.value = data ? (data as Profile) : null
  }

  const activeUser = computed(() => user.value ?? authUser.value)

  const fullName = computed(
    () =>
      profile.value?.full_name ||
      (activeUser.value?.user_metadata?.full_name as string | undefined) ||
      null,
  )

  const displayName = computed(() => fullName.value || activeUser.value?.email || 'User')

  const role = computed(() => profile.value?.role ?? 'employee')

  const jobTitle = computed(() => profile.value?.job_title ?? null)

  const employeeCode = computed(() => profile.value?.employee_code ?? null)

  const isAdmin = computed(() => role.value === 'admin')

  const isEmployee = computed(() => role.value === 'employee')

  const initials = computed(() => {
    const source = fullName.value || activeUser.value?.email || 'U'
    return source
      .split(/[\s@.]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

  return {
    profile,
    fullName,
    displayName,
    role,
    jobTitle,
    employeeCode,
    isAdmin,
    isEmployee,
    initials,
    fetchProfile,
  }
}
