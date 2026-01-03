import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { apiRequest } from '../apiClient.js'

function TripPlannerPage({ mode }) {
  const isCreate = mode === 'create'
  const navigate = useNavigate()
  const params = useParams()
  const { token } = useAuth()
  const [saving, setSaving] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)
  const [error, setError] = useState('')
  const [tripMeta, setTripMeta] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    budget_total: '',
  })
  const [stops, setStops] = useState([])
  const [addingSection, setAddingSection] = useState(false)
  const [editingStopId, setEditingStopId] = useState(null)
  const [editingStopDraft, setEditingStopDraft] = useState(null)
  const [newSection, setNewSection] = useState({
    city_name: '',
    country: '',
    start_date: '',
    end_date: '',
    notes: '',
  })

  useEffect(() => {
    async function loadTrip() {
      if (isCreate || !params.tripId) return
      try {
        const data = await apiRequest(`/trips/${params.tripId}`, { token })
        const t = data.trip
        setTripMeta({
          name: t.name,
          start_date: t.start_date,
          end_date: t.end_date,
          description: t.description || '',
          budget_total: t.budget_total || '',
        })
        setStops(data.stops || [])
      } catch (err) {
        setError(err.message)
      }
    }
    if (token) loadTrip()
  }, [isCreate, params.tripId, token])

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      if (isCreate) {
        const created = await apiRequest('/trips', {
          method: 'POST',
          token,
          body: {
            name: tripMeta.name,
            start_date: tripMeta.start_date,
            end_date: tripMeta.end_date,
            description: tripMeta.description,
            budget_total: tripMeta.budget_total ? Number(tripMeta.budget_total) : null,
          },
        })
        navigate(`/trips/${created.id}`, { replace: true })
      } else {
        await apiRequest(`/trips/${params.tripId}`, {
          method: 'PUT',
          token,
          body: {
            name: tripMeta.name,
            start_date: tripMeta.start_date,
            end_date: tripMeta.end_date,
            description: tripMeta.description,
            budget_total: tripMeta.budget_total ? Number(tripMeta.budget_total) : null,
          },
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleAddSection(e) {
    e.preventDefault()
    if (!params.tripId) return
    setError('')
    setAddingSection(true)
    try {
      const created = await apiRequest(`/trips/${params.tripId}/stops`, {
        method: 'POST',
        token,
        body: newSection,
      })
      setStops((prev) => [...prev, created])
      setNewSection({ city_name: '', country: '', start_date: '', end_date: '', notes: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingSection(false)
    }
  }

  function startEditStop(stop) {
    setEditingStopId(stop.id)
    setEditingStopDraft({
      city_name: stop.city_name || '',
      country: stop.city_country || '',
      start_date: stop.start_date || '',
      end_date: stop.end_date || '',
      notes: stop.notes || '',
    })
  }

  function cancelEditStop() {
    setEditingStopId(null)
    setEditingStopDraft(null)
  }

  async function saveEditStop() {
    if (!editingStopId || !editingStopDraft) return
    setError('')
    try {
      const updated = await apiRequest(`/trips/${params.tripId}/stops/${editingStopId}`, {
        method: 'PUT',
        token,
        body: editingStopDraft,
      })
      setStops((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
      cancelEditStop()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteStop(id) {
    if (!window.confirm('Delete this section?')) return
    setError('')
    try {
      await apiRequest(`/trips/${params.tripId}/stops/${id}`, {
        method: 'DELETE',
        token,
      })
      setStops((prev) => prev.filter((s) => s.id !== id))
      if (editingStopId === id) cancelEditStop()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleShare() {
    if (!params.tripId) return
    setShareBusy(true)
    try {
      const data = await apiRequest(`/trips/${params.tripId}/share`, { method: 'POST', token })
      const url = `${window.location.origin}${data.public_url}`
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        alert('Shareable link copied to clipboard!')
      } else {
        window.prompt('Share this link', url)
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setShareBusy(false)
    }
  }

  return (
    <div className="page planner-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{isCreate ? 'Plan New Trip' : 'Itinerary Builder'}</h1>
          <p className="page-subtitle">
            Add cities, plan day-wise activities, and track budget impact automatically.
          </p>
        </div>
        <div className="planner-header-actions">
          <button className="secondary-btn" onClick={handleShare} disabled={shareBusy}>
            {shareBusy ? 'Sharing…' : 'Share'}
          </button>
          <button className="primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="planner-layout">
        <aside className="planner-column planner-left">
          <section className="card">
            <h2 className="section-title">Trip overview</h2>
            <p className="trip-meta">Basic details for this trip</p>
            <div className="stops-list">
              <label className="field">
                <span>Trip name</span>
                <input
                  className="input"
                  value={tripMeta.name}
                  onChange={(e) => setTripMeta({ ...tripMeta, name: e.target.value })}
                  placeholder="Summer in Europe"
                  required
                />
              </label>
              <label className="field">
                <span>Start date</span>
                <input
                  className="input"
                  type="date"
                  value={tripMeta.start_date}
                  onChange={(e) => setTripMeta({ ...tripMeta, start_date: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>End date</span>
                <input
                  className="input"
                  type="date"
                  value={tripMeta.end_date}
                  onChange={(e) => setTripMeta({ ...tripMeta, end_date: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Budget (optional)</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={tripMeta.budget_total}
                  onChange={(e) => setTripMeta({ ...tripMeta, budget_total: e.target.value })}
                  placeholder="3500"
                />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  className="input"
                  rows={3}
                  value={tripMeta.description}
                  onChange={(e) => setTripMeta({ ...tripMeta, description: e.target.value })}
                  placeholder="Short summary of your trip"
                />
              </label>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Sections</h2>
            <p className="trip-meta">
              Break your trip into sections – each can be a city, region, or hotel stay.
            </p>
            <div className="stops-list">
              {stops.map((stop, index) => {
                const isEditing = editingStopId === stop.id
                const draft = editingStopDraft || {}
                return (
                  <div key={stop.id} className="section-card">
                    <div className="section-card-header">
                      <span className="section-label">Section {index + 1}</span>
                      {isEditing ? (
                        <>
                          <input
                            className="input small-input"
                            placeholder="City"
                            value={draft.city_name}
                            onChange={(e) =>
                              setEditingStopDraft({ ...draft, city_name: e.target.value })
                            }
                          />
                          <input
                            className="input small-input"
                            placeholder="Country"
                            value={draft.country}
                            onChange={(e) =>
                              setEditingStopDraft({ ...draft, country: e.target.value })
                            }
                          />
                        </>
                      ) : (
                        <span className="section-city">
                          {stop.city_name || 'Unnamed stop'}
                          {stop.city_country ? `, ${stop.city_country}` : ''}
                        </span>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        className="input"
                        rows={2}
                        value={draft.notes}
                        onChange={(e) =>
                          setEditingStopDraft({ ...draft, notes: e.target.value })
                        }
                      />
                    ) : (
                      <p className="section-notes">
                        {stop.notes ||
                          'All the necessary information about this section. This can be anything like travel section, hotel, or any other activity.'}
                      </p>
                    )}
                    <div className="section-actions-row">
                      {isEditing ? (
                        <>
                          <input
                            className="input small-input"
                            type="date"
                            value={draft.start_date}
                            onChange={(e) =>
                              setEditingStopDraft({ ...draft, start_date: e.target.value })
                            }
                          />
                          <input
                            className="input small-input"
                            type="date"
                            value={draft.end_date}
                            onChange={(e) =>
                              setEditingStopDraft({ ...draft, end_date: e.target.value })
                            }
                          />
                          <button
                            type="button"
                            className="primary-btn small"
                            onClick={saveEditStop}
                          >
                            Save section
                          </button>
                          <button
                            type="button"
                            className="ghost-btn small"
                            onClick={cancelEditStop}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="secondary-btn small">
                            Date range: {stop.start_date || 'xxx'} – {stop.end_date || 'yyy'}
                          </button>
                          <button type="button" className="secondary-btn small">
                            Budget of this section
                          </button>
                          <button
                            type="button"
                            className="ghost-btn small"
                            onClick={() => startEditStop(stop)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ghost-btn small danger"
                            onClick={() => deleteStop(stop.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
              {stops.length === 0 && (
                <p className="trip-meta">No sections yet. Add your first section below.</p>
              )}
            </div>

            <form className="new-section-form" onSubmit={handleAddSection}>
              <h3 className="section-subtitle">Add another section</h3>
              <div className="new-section-grid">
                <label className="field">
                  <span>City</span>
                  <input
                    className="input"
                    value={newSection.city_name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, city_name: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Country</span>
                  <input
                    className="input"
                    value={newSection.country}
                    onChange={(e) =>
                      setNewSection({ ...newSection, country: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>Start date</span>
                  <input
                    className="input"
                    type="date"
                    value={newSection.start_date}
                    onChange={(e) =>
                      setNewSection({ ...newSection, start_date: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="field">
                  <span>End date</span>
                  <input
                    className="input"
                    type="date"
                    value={newSection.end_date}
                    onChange={(e) =>
                      setNewSection({ ...newSection, end_date: e.target.value })
                    }
                    required
                  />
                </label>
                <label className="field new-section-notes">
                  <span>Section notes</span>
                  <textarea
                    className="input"
                    rows={2}
                    placeholder="All the necessary information about this section..."
                    value={newSection.notes}
                    onChange={(e) =>
                      setNewSection({ ...newSection, notes: e.target.value })
                    }
                  />
                </label>
              </div>
              <button className="primary-btn full" type="submit" disabled={addingSection}>
                {addingSection ? 'Adding section…' : '+ Add another section'}
              </button>
            </form>
          </section>
        </aside>

        <aside className="planner-right">
          <section className="card">
            <h2 className="section-title">Map / Timeline</h2>
            <div style={{ height: 280, borderRadius: 8, background: 'linear-gradient(135deg, rgba(124,92,255,0.06), rgba(6,182,179,0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
              Map and timeline placeholder
            </div>
          </section>

          <section className="card">
            <h2 className="section-title">Trip summary</h2>
            <p className="trip-meta">Budget: ${tripMeta.budget_total || 0}</p>
            <p className="trip-meta">Dates: {tripMeta.start_date} – {tripMeta.end_date}</p>
            <div style={{ marginTop: 12 }}>
              <button className="secondary-btn full" onClick={() => alert('Preview map')}>Preview route</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default TripPlannerPage
