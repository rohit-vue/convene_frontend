import type { Notification } from '~/types/notifications'

export const useNotifications = () => {
  const { apiFetch } = useApi()

  const list = () => apiFetch<Notification[]>('/api/notifications')
  const unreadCount = () => apiFetch<{ count: number }>('/api/notifications/unread-count')
  const markRead = (id: string) =>
    apiFetch<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH' })

  return { list, unreadCount, markRead }
}
