import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'
import Calendar from '../components/Calendar.jsx'

function DashboardPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | ongoing | upcoming | completed
  const [sortOrder, setSortOrder] = useState('asc') // asc | desc
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
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
    let list = trips.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase().trim()),
    )

    if (statusFilter !== 'all') {
      list = list.filter((t) => getStatus(t) === statusFilter)
    }

    list = [...list].sort((a, b) => {
      const aDate = a.start_date ? new Date(a.start_date) : new Date(8640000000000000)
      const bDate = b.start_date ? new Date(b.start_date) : new Date(8640000000000000)
      return aDate - bDate
    })

    if (sortOrder === 'desc') list.reverse()

    return list
  }, [trips, search, statusFilter, sortOrder])

  const topRegions = [
    'Paris & Northern France',
    'Southeast Asia loop (Bangkok – Hanoi – Bali)',
    'US city break (NYC – Boston – DC)',
    'Budget beach escape (Lisbon & Algarve)',
    'Workcation friendly (Lisbon & Barcelona)',
  ]

  function handleRegionClick(label) {
    // Navigate to create-trip screen with suggested place/name
    navigate('/trips/new', {
      state: {
        suggestedPlace: label,
        suggestedName: label,
      },
    })
  }

  function setStatusAndClose(value) {
    setStatusFilter(value)
    setStatusMenuOpen(false)
  }

  function toggleSortOrder() {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const filterLabel =
    statusFilter === 'all'
      ? 'Filter: All'
      : statusFilter === 'ongoing'
      ? 'Filter: Ongoing'
      : statusFilter === 'upcoming'
      ? 'Filter: Upcoming'
      : 'Filter: Completed'

  const sortLabel = `Sort: Start date ${sortOrder === 'asc' ? '↑' : '↓'}`

  return (
    <div className="page dashboard-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Welcome back, Traveler</h1>
          <p className="page-subtitle">Plan and visualize your multi-city trips in one place.</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/trips/new')}>
          Plan New Trip
        </button>
      </div>

      <div className="dashboard-banner">
        {/* Replace "/banner.jpg" with your actual banner filename placed in client/public */}
        <img src="/banner.jpg" alt="GlobeTrotter travel banner" />
      </div>

      <div className="dashboard-layout">
        <section className="dashboard-main">
          <div className="dashboard-search-row">
            <input
              className="input dashboard-search-input"
              placeholder="Search bar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="dashboard-search-actions">
              <button type="button" className="ghost-btn small">
                Group by
              </button>
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
                    <button
                      type="button"
                      className="ghost-btn small dropdown-item"
                      onClick={() => setStatusAndClose('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className="ghost-btn small dropdown-item"
                      onClick={() => setStatusAndClose('ongoing')}
                    >
                      Ongoing
                    </button>
                    <button
                      type="button"
                      className="ghost-btn small dropdown-item"
                      onClick={() => setStatusAndClose('upcoming')}
                    >
                      Upcoming
                    </button>
                    <button
                      type="button"
                      className="ghost-btn small dropdown-item"
                      onClick={() => setStatusAndClose('completed')}
                    >
                      Completed
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="ghost-btn small"
                onClick={toggleSortOrder}
              >
                {sortLabel}
              </button>
            </div>
          </div>

          <section className="card dashboard-card-section">
            <h2 className="section-title">Top regional selections</h2>
            <div className="region-card-row">
              {topRegions.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="region-card region-card-button"
                  onClick={() => handleRegionClick(label)}
                >
                  <div className="region-card-body">{label}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="card dashboard-card-section">
              <div className="section-header-row">
                <h2 className="section-title">Previous trips</h2>
                <button
                  type="button"
                  className="secondary-btn small"
                  onClick={() => navigate('/trips/new')}
                >
                  + Plan a trip
                </button>
              </div>
              <div style={{ marginTop: 12 }}>
                <Calendar trips={trips.map(t => ({ id: t.id, label: t.name, start: t.start_date, end: t.end_date }))} />
              </div>
            {error && <p className="error-text">{error}</p>}
            <div className="trip-card-grid">
              {visibleTrips.map((trip) => {
                const status = getStatus(trip)
                const statusLabel =
                  status === 'ongoing'
                    ? 'Ongoing'
                    : status === 'completed'
                    ? 'Completed'
                    : 'Upcoming'
                const statusClass =
                  status === 'completed' ? 'pill pill-muted' : 'pill pill-status'
                return (
                  <div
                    key={trip.id}
                    className="trip-card"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    <div className="trip-cover" />
                    <div className="trip-body">
                      <div className="trip-title-row">
                        <h3>{trip.name}</h3>
                        <span className={statusClass}>{statusLabel}</span>
                      </div>
                    <p className="trip-meta">
                      {trip.start_date} – {trip.end_date} · {trip.city_count || 0} cities
                    </p>
                    <p className="trip-cost">Est. ${trip.estimated_total_cost || 0}</p>
                  </div>
                </div>
              )})}
              {visibleTrips.length === 0 && !error && (
                <div className="trip-card placeholder">
                  <div className="trip-cover" />
                  <div className="trip-body">
                    <div className="trip-title-row">
                      <h3>No trips yet</h3>
                    </div>
                    <p className="trip-meta">
                      Click "Plan New Trip" to create your first itinerary.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="dashboard-side">
          <section className="card">
            <h2 className="section-title">Budget Highlights</h2>
            <div className="stat-row">
              <div className="stat-card">
                <div className="stat-label">Total planned</div>
                <div className="stat-value">$5,200</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg. daily</div>
                <div className="stat-value">$180</div>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Popular cities</h2>
            <ul className="city-list">
              <li className="city-item">
                <div>
                  <div className="city-name">Paris, France</div>
                  <div className="city-tags">
                    <span className="pill">Popular</span>
                    <span className="pill pill-muted">High cost</span>
                  </div>
                </div>
                <button className="secondary-btn small">Start here</button>
              </li>
              <li className="city-item">
                <div>
                  <div className="city-name">Lisbon, Portugal</div>
                  <div className="city-tags">
                    <span className="pill">Trending</span>
                    <span className="pill pill-muted">Budget</span>
                  </div>
                </div>
                <button className="secondary-btn small">Start here</button>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default DashboardPage
