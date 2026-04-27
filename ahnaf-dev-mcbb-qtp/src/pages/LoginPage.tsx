import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email':       'Invalid email address.',
  'auth/user-disabled':       'This account has been disabled.',
  'auth/user-not-found':      'No account found with this email.',
  'auth/wrong-password':      'Incorrect password.',
  'auth/invalid-credential':  'Invalid email or password.',
  'auth/too-many-requests':   'Too many attempts. Please try again later.',
}

const LoginPage: React.FC = () => {
  const { currentUser } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as any)?.from?.pathname ?? '/query-tool'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  if (currentUser) return <Navigate to={from} replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(ERROR_MESSAGES[err.code] ?? 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-page'>
      <div className='login-card'>

        <div className='login-brand'>
          <img src={`${import.meta.env.BASE_URL}logo_mayo.svg`} alt='Mayo Clinic' className='login-logo' />
          <div className='login-brand-divider' />
          <div className='login-brand-text'>
            <span className='login-platform-name'>Brain Bank Data Platform</span>
            <span className='login-platform-sub'>Researcher Access</span>
          </div>
        </div>

        <form className='login-form' onSubmit={handleSubmit}>
          <div className='login-field'>
            <label className='login-label'>Email</label>
            <input
              className='login-input'
              type='email'
              autoComplete='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='you@institution.edu'
              required
            />
          </div>

          <div className='login-field'>
            <label className='login-label'>Password</label>
            <input
              className='login-input'
              type='password'
              autoComplete='current-password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              required
            />
          </div>

          {error && <p className='login-error'>{error}</p>}

          <button className='login-submit' type='submit' disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default LoginPage
