export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const MAX_TOASTS = 3
const DEFAULT_DURATION = 3500

export function useToast() {
  const toasts = useState<ToastItem[]>('app-toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(message: string, type: ToastType = 'info', duration = DEFAULT_DURATION) {
    const text = String(message || '').trim()
    if (!text) return

    const id = Date.now() + Math.random()
    toasts.value = [...toasts.value, { id, message: text, type }].slice(-MAX_TOASTS)

    if (import.meta.client) {
      setTimeout(() => dismiss(id), duration)
    }
  }

  return {
    toasts,
    push,
    dismiss,
    success: (message: string, duration?: number) => push(message, 'success', duration ?? DEFAULT_DURATION),
    error: (message: string, duration?: number) => push(message, 'error', duration ?? DEFAULT_DURATION),
    info: (message: string, duration?: number) => push(message, 'info', duration ?? DEFAULT_DURATION),
  }
}

export function toastErrorMessage(error: unknown, fallback = 'Something went wrong.') {
  const e = error as { data?: { error?: string }; message?: string } | null
  return e?.data?.error || e?.message || fallback
}
