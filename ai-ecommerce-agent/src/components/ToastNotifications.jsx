import { useCart } from '../hooks/useCart'

export default function ToastNotifications() {
  const { toasts } = useCart()

  if (!toasts || toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-bubble toast-${toast.type || 'info'}`}>
          <span className="toast-icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="toast-msg">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
