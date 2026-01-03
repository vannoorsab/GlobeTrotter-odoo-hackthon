import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'

function TripSummaryPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [trip, setTrip] = useState(null)
  const [activities, setActivities] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest(`/trips/${tripId}`, { token })
        setTrip(data.trip)
        setActivities(data.activities || [])
      } catch (err) {
        setError(err.message)
      }
    }
    if (token && tripId) load()
  }, [token, tripId])

  const days = useMemo(() => {
    const map = new Map()
    const q = search.toLowerCase().trim()

    for (const a of activities) {
      const date = a.scheduled_date
      if (!date) continue
      const name = (a.name || '').toLowerCase()
      const cat = (a.category || '').toLowerCase()
      if (q && !name.includes(q) && !cat.includes(q)) continue

      if (!map.has(date)) {
        map.set(date, { date, items: [], total: 0 })
      }
      const entry = map.get(date)
      entry.items.push(a)
      const cost = Number(a.cost || 0)
      entry.total += isNaN(cost) ? 0 : cost
    }

    const arr = Array.from(map.values())
    arr.sort((a, b) => new Date(a.date) - new Date(b.date))
    return arr
  }, [activities, search])

  const title = trip ? `Itinerary for ${trip.name}` : 'Itinerary'

  return (
    <div className="page itinerary-summary-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">
            Read-only view of your day-wise activities with budget for each day.
          </p>
        </div>
        <button className="ghost-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <section className="card">
        <div className="trips-filter-row">
          <input
            className="input"
            placeholder="Search activities (e.g. museum, trekking)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {error && <p className="error-text">{error}</p>}

        <h2 className="section-title">Itinerary for selected days</h2>
        <div className="itinerary-table">
          <div className="itinerary-header-row">
            <span className="itinerary-col-label" />
            <span className="itinerary-col-label">Physical activity</span>
            <span className="itinerary-col-label right">Expense</span>
          </div>

          {days.length === 0 && !error && (
            <p className="trip-meta">No scheduled activities yet for this trip.</p>
          )}

          {days.map((day, index) => (
            <div key={day.date} className="itinerary-day-block">
              <div className="itinerary-day-label">Day {index + 1}</div>
              <div className="itinerary-day-inner">
                {day.items.map((a) => (
                  <div key={a.id} className="itinerary-row">
                    <div className="itinerary-time-cell">
                      {a.scheduled_date}
                    </div>
                    <div className="itinerary-activity-cell">
                      <div className="itinerary-activity-name">{a.name}</div>
                      <div className="itinerary-activity-meta">
                        {a.category || 'Activity'}
                      </div>
                    </div>
                    <div className="itinerary-expense-cell">
                      {a.cost != null ? `$${Number(a.cost).toFixed(0)}` : '-'}
                    </div>
                  </div>
                ))}
                <div className="itinerary-row total-row">
                  <div className="itinerary-time-cell" />
                  <div className="itinerary-activity-cell">
                    <strong>Day total</strong>
                  </div>
                  <div className="itinerary-expense-cell">
                    <strong>${day.total.toFixed(0)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default TripSummaryPage
