const AVATAR_BUCKET = 'avatars'
const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const AVATAR_SIZE = 256

function resizeToSquareWebp(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const canvas = document.createElement('canvas')
      canvas.width = AVATAR_SIZE
      canvas.height = AVATAR_SIZE

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process image'))
        return
      }

      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, AVATAR_SIZE, AVATAR_SIZE)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))),
        'image/webp',
        0.85,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image'))
    }

    img.src = objectUrl
  })
}

export const useAvatarUpload = () => {
  const supabase = useSupabaseClient()
  const { update: updateProfile } = useProfileApi()

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) {
      return 'Please choose a JPEG, PNG, or WebP image.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be 2 MB or smaller.'
    }
    return null
  }

  async function resolveUserId(): Promise<string> {
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user?.id
    if (!userId) throw new Error('You must be signed in to update your photo.')
    return userId
  }

  async function uploadAvatar(file: File): Promise<string> {
    const validationError = validateFile(file)
    if (validationError) throw new Error(validationError)

    const userId = await resolveUserId()
    const path = `${userId}/avatar.webp`
    const resized = await resizeToSquareWebp(file)

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, resized, { upsert: true, contentType: 'image/webp' })

    if (uploadError) throw new Error(uploadError.message)

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`

    await updateProfile({ avatar_url: avatarUrl })
    return avatarUrl
  }

  async function removeAvatar(): Promise<void> {
    const userId = await resolveUserId()
    const path = `${userId}/avatar.webp`

    await supabase.storage.from(AVATAR_BUCKET).remove([path])
    await updateProfile({ avatar_url: null })
  }

  return { uploadAvatar, removeAvatar, validateFile }
}
