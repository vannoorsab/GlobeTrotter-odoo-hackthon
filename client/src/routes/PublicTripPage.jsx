function PublicTripPage() {
  return (
    <div className="public-page">
      <header className="public-header">
        <div>
          <div className="logo-text small">GlobeTrotter</div>
          <h1 className="page-title">Summer in Europe · Shared Itinerary</h1>
          <p className="page-subtitle">10 days · 3 cities · Est. $3,450</p>
        </div>
        <button className="primary-btn">Copy this trip</button>
      </header>

      <div className="public-layout">
        <section className="card">
          <h2 className="section-title">Trip summary</h2>
          <p>
            A 10-day trip visiting Paris, Barcelona, and Lisbon with a balance of sightseeing,
            food, and downtime. Paris is the priciest stop, while Lisbon keeps the daily
            average lower.
          </p>
        </section>

        <section className="card">
          <h2 className="section-title">Itinerary</h2>
          <div className="timeline-scroll">
            <div className="day-column">
              <div className="day-header">
                <div className="day-date">Mon · Jun 2</div>
                <div className="day-city">Paris</div>
              </div>
              <div className="day-activities">
                <div className="activity-block">
                  <div className="activity-main">
                    <div className="activity-time">09:00</div>
                    <div>
                      <div className="activity-name">Eiffel Tower</div>
                      <div className="activity-meta">Sightseeing · 2h</div>
                    </div>
                  </div>
                  <div className="activity-cost">$35</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Budget</h2>
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-label">Total cost</div>
              <div className="stat-value">$3,450</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg. per day</div>
              <div className="stat-value">$345</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PublicTripPage
