import './admin.css'
import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

export default function AdminPanel() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')

  if (!user?.is_admin) {
    return (
      <div className="admin-unauth">
        <h2>Access denied</h2>
        <p>You must be an admin to view this page.</p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-left">
        <div className="admin-controls">
          <input className="admin-search" placeholder="Search users, cities, trips..." />
          <div className="admin-actions">
            <button onClick={() => setTab('manage')}>Manage Users</button>
            <button onClick={() => setTab('cities')}>Popular cities</button>
            <button onClick={() => setTab('activities')}>Popular activities</button>
            <button onClick={() => setTab('analytics')}>Trends & analytics</button>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3>{tab === 'overview' ? 'Overview' : tab}</h3>
          </div>
          <div className="admin-card-body">
            <div className="chart-row">
              <div className="big-chart">(Chart placeholder)</div>
              <div className="small-pie">(Pie)</div>
            </div>

            <div className="stats-row">
              <div className="bar-chart">(Bar chart)</div>
              <div className="list-summary">
                <h4>Recent activity</h4>
                <ul>
                  <li>User A created a trip</li>
                  <li>User B joined Community</li>
                  <li>Trip C was published</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="admin-right">
        <div className="admin-side-box">
          <h4>Manage User Section</h4>
          <p>This section is responsible for managing users and their actions.</p>
        </div>
        <div className="admin-side-box">
          <h4>Popular cities</h4>
          <p>Lists the popular cities where the users are visiting based on trends.</p>
        </div>
        <div className="admin-side-box">
          <h4>User trends & analytics</h4>
          <p>Provides analysis across various points and useful information.</p>
        </div>
      </aside>
    </div>
  )
}
