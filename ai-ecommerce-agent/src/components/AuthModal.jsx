import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
  } = useAuth()

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isAuthModalOpen) return null

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleClose = () => {
    resetForm()
    setIsAuthModalOpen(false)
  }

  const switchMode = (mode) => {
    setErrorMessage('')
    setSuccessMessage('')
    setAuthModalMode(mode)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.')
      return
    }

    if (authModalMode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please provide your full name.')
        return
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.')
        return
      }

      setIsLoading(true)
      const res = await register(name, email, password)
      setIsLoading(false)

      if (res.success) {
        setSuccessMessage('Account created successfully. Welcome to RAYA ATELIER.')
        setTimeout(() => handleClose(), 900)
      } else {
        setErrorMessage(res.error || 'Registration failed.')
      }
    } else {
      setIsLoading(true)
      const res = await login(email, password)
      setIsLoading(false)

      if (res.success) {
        setSuccessMessage('Welcome back to RAYA ATELIER.')
        setTimeout(() => handleClose(), 700)
      } else {
        setErrorMessage(res.error || 'Invalid credentials.')
      }
    }
  }

  const fillDemoCredentials = () => {
    setEmail('demo@rayaatelier.com')
    setPassword('RayaDemo2026!')
    setErrorMessage('')
  }

  return (
    <div className="drawer-overlay" onClick={handleClose}>
      <div
        className="auth-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          type="button"
          className="drawer-close-btn auth-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-brand-logo">
            <span className="brand-logo-main">RAYA</span>
            <span className="brand-logo-sub">ATELIER</span>
          </div>
          <h3 id="auth-modal-title" className="auth-title">
            {authModalMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h3>
          <p className="auth-subtitle">
            {authModalMode === 'login'
              ? 'Access your private bag, curated wishlist, and order history.'
              : 'Join the archive for personalized styling and expedited checkout.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="auth-alert auth-alert-success" role="alert">
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authModalMode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name">FULL NAME</label>
              <input
                id="auth-name"
                type="text"
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">EMAIL ADDRESS</label>
            <input
              id="auth-email"
              type="email"
              placeholder="client@rayaatelier.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="auth-field">
            <div className="auth-field-header">
              <label htmlFor="auth-password">PASSWORD</label>
              <button
                type="button"
                className="auth-show-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {authModalMode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">CONFIRM PASSWORD</label>
              <input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-atelier-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="auth-btn-loading">AUTHENTICATING...</span>
            ) : authModalMode === 'login' ? (
              'ENTER THE ATELIER'
            ) : (
              'CREATE ACCOUNT'
            )}
          </button>
        </form>

        {/* Demo Account Quick-Fill */}
        {authModalMode === 'login' && (
          <div className="auth-demo-helper">
            <span>Portfolio Demo Account:</span>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={fillDemoCredentials}
            >
              Autofill Demo Client
            </button>
          </div>
        )}

        {/* Footer Toggle */}
        <div className="auth-footer">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => switchMode('register')}
              >
                Create an Account
              </button>
            </p>
          ) : (
            <p>
              Already a client?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => switchMode('login')}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
