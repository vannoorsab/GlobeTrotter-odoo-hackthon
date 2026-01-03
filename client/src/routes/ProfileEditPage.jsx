import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'

export default function ProfileEditPage() {
  const { token, setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', phone: '', city: '', country: '', about: '', profile_image_data: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest('/users/me', { token })
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          city: data.city || '',
          country: data.country || '',
          about: data.about || '',
          profile_image_data: data.profile_image_data || '',
        })
      } catch (err) {
        setError(err.message)
      }
    }
    if (token) load()
  }, [token])

  function onChange(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handlePhotoChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => onChange('profile_image_data', reader.result)
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const updated = await apiRequest('/users/me', { method: 'PUT', token, body: form })
      setUser(updated)
      navigate('/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Edit profile</h1>
      {error && <p className="error-text">{error}</p>}
      <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <label className="field">
          <span>Full name</span>
          <input value={form.full_name} onChange={(e) => onChange('full_name', e.target.value)} />
        </label>
        <label className="field">
          <span>Phone</span>
          <input value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
        </label>
        <label className="field">
          <span>City</span>
          <input value={form.city} onChange={(e) => onChange('city', e.target.value)} />
        </label>
        <label className="field">
          <span>Country</span>
          <input value={form.country} onChange={(e) => onChange('country', e.target.value)} />
        </label>
        <label className="field">
          <span>About</span>
          <textarea value={form.about} onChange={(e) => onChange('about', e.target.value)} rows={4} />
        </label>
        <label className="field">
          <span>Profile photo</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {form.profile_image_data && (
              <img src={form.profile_image_data} alt="preview" style={{ width: 64, height: 64, borderRadius: 8 }} />
            )}
          </div>
        </label>
        <div style={{ marginTop: 12 }}>
          <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save profile'}</button>
          <button type="button" className="ghost-btn" onClick={() => navigate('/profile')} style={{ marginLeft: 8 }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
