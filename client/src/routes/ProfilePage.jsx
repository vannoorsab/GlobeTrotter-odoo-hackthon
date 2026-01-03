import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'

function ProfilePage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await apiRequest('/trips', { token })
        setTrips(data)
      } catch (err) {
        setError(err.message)
      }
    }
    if (token) loadTrips()
  }, [token])

  const today = new Date()

  const { preplanned, previous } = useMemo(() => {
    const pre = []
    const prev = []
    for (const t of trips) {
      if (!t.start_date || !t.end_date) {
        pre.push(t)
        continue
      }
      const start = new Date(t.start_date)
      const end = new Date(t.end_date)
      if (end < today) prev.push(t)
      else pre.push(t)
    }
    return { preplanned: pre, previous: prev }
  }, [trips, today])

  function initials(name) {
    if (!name) return 'U'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U'
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
  }

  return (
    <div className="page profile-page">
      <section className="card profile-header-card">
        <div className="profile-header-layout">
          <div className="profile-avatar-circle">
            {user?.profile_image_data ? (
              <img src={user.profile_image_data} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span>{initials(user?.full_name)}</span>
            )}
          </div>
          <div className="profile-details">
            <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
              {user?.full_name || 'Traveler'}
            </h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-blurb">{user?.about}</p>
            <div style={{ marginTop: 8 }}>
              <button className="secondary-btn small" onClick={() => navigate('/profile/edit')}>Edit profile</button>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Preplanned trips</h2>
        {error && <p className="error-text">{error}</p>}
        <div className="trip-card-grid">
          {preplanned.map((trip) => (
            <div key={trip.id} className="trip-card">
              <div className="trip-cover" />
              <div className="trip-body">
                <div className="trip-title-row">
                  <h3>{trip.name}</h3>
                </div>
                <p className="trip-meta">
                  {trip.start_date} – {trip.end_date} · {trip.city_count || 0} cities
                </p>
              </div>
              <div className="trip-actions">
                <button
                  className="secondary-btn small"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {preplanned.length === 0 && !error && (
            <div className="trip-card placeholder">
              <div className="trip-cover" />
              <div className="trip-body">
                <div className="trip-title-row">
                  <h3>No upcoming trips</h3>
                </div>
                <p className="trip-meta">Plan a new trip to see it here.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Previous trips</h2>
        <div className="trip-card-grid">
          {previous.map((trip) => (
            <div key={trip.id} className="trip-card">
              <div className="trip-cover" />
              <div className="trip-body">
                <div className="trip-title-row">
                  <h3>{trip.name}</h3>
                </div>
                <p className="trip-meta">
                  {trip.start_date} – {trip.end_date} · {trip.city_count || 0} cities
                </p>
              </div>
              <div className="trip-actions">
                <button
                  className="secondary-btn small"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {previous.length === 0 && !error && (
            <div className="trip-card placeholder">
              <div className="trip-cover" />
              <div className="trip-body">
                <div className="trip-title-row">
                  <h3>No previous trips yet</h3>
                </div>
                <p className="trip-meta">Completed trips will appear here over time.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
