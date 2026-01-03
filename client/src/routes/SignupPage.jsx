import './auth.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'

function SignupPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [about, setAbout] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState('')
  const [photoFile, setPhotoFile] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fullName = `${firstName} ${lastName}`.trim()
    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: {
          fullName,
          email,
          password,
          phone,
          city,
          country,
          about,
          profile_image_base64: photoDataUrl || undefined,
        },
      })
      setUser(data.user)
      setToken(data.token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handlePhotoChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setPhotoFile(f)
    const reader = new FileReader()
    reader.onload = () => setPhotoDataUrl(reader.result)
    reader.readAsDataURL(f)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="GlobeTrotter" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 8 }} />
          <div className="logo-text">GlobeTrotter</div>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Save trips, budgets, and itineraries in one place.</p>

        <div className="signup-photo">
          <label className="signup-photo-label">
            <div className="signup-photo-circle">
              {photoDataUrl ? (
                <img src={photoDataUrl} alt="Profile preview" className="signup-photo-img" />
              ) : (
                'Photo'
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="signup-photo-input"
            />
          </label>
        </div>

        {error && <p className="error-text">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="signup-grid-two">
            <label className="field">
              <span>First name</span>
              <input
                type="text"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Last name</span>
              <input
                type="text"
                placeholder="Traveler"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="signup-grid-two">
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Phone number</span>
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>

          <div className="signup-grid-two">
            <label className="field">
              <span>City</span>
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Country</span>
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span>Additional information</span>
            <textarea
              className="input signup-textarea"
              placeholder="Tell us a bit about your travel style, preferences, or upcoming plans..."
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-btn full" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
