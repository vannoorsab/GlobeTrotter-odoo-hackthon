import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'
import Calendar from '../components/Calendar.jsx'

function MyTripsPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [trips, setTrips] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('asc')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTrips() {
      try {
        const data = await apiRequest('/trips', { token })
        setTrips(data)
      } catch (err) {
        setError(err.message || 'Failed to load trips')
      }
    }
    if (token) loadTrips()
  }, [token])

  function getStatus(trip) {
    if (!trip.start_date || !trip.end_date) return 'upcoming'
    const today = new Date()
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    if (start <= today && end >= today) return 'ongoing'
    if (end < today) return 'completed'
    return 'upcoming'
  }

  const visibleTrips = useMemo(() => {
    const q = search.toLowerCase().trim()

    let list = trips.filter((t) => {
      const name = (t.name || '').toLowerCase()
      const desc = (t.description || '').toLowerCase()
      return !q || name.includes(q) || desc.includes(q)
    })

    if (statusFilter !== 'all') {
      list = list.filter((t) => getStatus(t) === statusFilter)
    }

    list.sort((a, b) => {
      const aDate = a.start_date ? new Date(a.start_date) : new Date(8640000000000000)
      const bDate = b.start_date ? new Date(b.start_date) : new Date(8640000000000000)
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate
    })

    return list
  }, [trips, search, statusFilter, sortOrder])

  async function handleDelete(id) {
    if (!window.confirm('Delete this trip?')) return
    try {
      await apiRequest(`/trips/${id}`, { method: 'DELETE', token })
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  const filterLabel =
    statusFilter === 'all'
      ? 'Filter: All'
      : statusFilter === 'ongoing'
      ? 'Filter: Ongoing'
      : statusFilter === 'upcoming'
      ? 'Filter: Upcoming'
      : 'Filter: Completed'

  return (
    <div className="page trips-page">
      <section className="card">
        <Calendar trips={trips.map(t => ({ id: t.id, label: t.name, start: t.start_date, end: t.end_date }))} />
      </section>
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-subtitle">
            View, edit, and manage all your itineraries.
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() => navigate('/trips/new')}
        >
          Plan New Trip
        </button>
      </div>

      <section className="card">
        {/* Filters */}
        <div className="trips-filter-row">
          <input
            className="input"
            placeholder="Search by trip name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="trips-filter-actions">
            <div className="dropdown">
              <button
                type="button"
                className="ghost-btn small"
                onClick={() => setStatusMenuOpen((o) => !o)}
              >
                {filterLabel}
              </button>

              {statusMenuOpen && (
                <div className="dropdown-menu">
                  {['all', 'ongoing', 'upcoming', 'completed'].map((s) => (
                    <button
                      key={s}
                      className="ghost-btn small dropdown-item"
                      onClick={() => {
                        setStatusFilter(s)
                        setStatusMenuOpen(false)
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="ghost-btn small"
              onClick={() =>
                setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))
              }
            >
              Sort: Start date {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* Trips Grid */}
        <div className="trip-card-grid">
          {visibleTrips.map((trip) => {
            const status = getStatus(trip)
            const statusClass =
              status === 'completed'
                ? 'pill pill-muted'
                : 'pill pill-status'

            return (
              <div key={trip.id} className="trip-card">
                <div className="trip-cover" />

                <div className="trip-body">
                  <div className="trip-title-row">
                    <h3>{trip.name}</h3>
                    <span className={statusClass}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <p className="trip-meta">
                    {trip.start_date} – {trip.end_date} ·{' '}
                    {trip.city_count || 0} cities
                  </p>

                  <p className="trip-cost">
                    Est. ${trip.estimated_total_cost || 0}
                  </p>
                </div>

                <div className="trip-actions">
                  <button
                    className="secondary-btn small"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    View / Edit
                  </button>

                  <button
                    className="ghost-btn small danger"
                    onClick={() => handleDelete(trip.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {visibleTrips.length === 0 && !error && (
          <div className="trip-card placeholder">
            <h3>No trips found</h3>
            <p>Try a different search or create a new trip.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default MyTripsPage
