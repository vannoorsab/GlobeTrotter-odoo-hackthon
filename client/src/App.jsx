import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import './App.css'

import LoginPage from './routes/LoginPage.jsx'
import SignupPage from './routes/SignupPage.jsx'
import DashboardPage from './routes/DashboardPage.jsx'
import AdminPanel from './routes/AdminPanel.jsx'
import MyTripsPage from './routes/MyTripsPage.jsx'
import TripPlannerPage from './routes/TripPlannerPage.jsx'
import CreateTripPage from './routes/CreateTripPage.jsx'
import ProfilePage from './routes/ProfilePage.jsx'
import ProfileEditPage from './routes/ProfileEditPage.jsx'
import PublicTripPage from './routes/PublicTripPage.jsx'
import CommunityPage from './routes/CommunityPage.jsx'
import { useAuth } from './AuthContext.jsx'

function AppShell({ children }) {
  const location = useLocation()
  const { user, token, logout } = useAuth()

  const navItems = [
    { label: 'Dashboard', to: '/' },
    { label: 'My Trips', to: '/trips' },
    { label: 'Community', to: '/community' },
    { label: 'Plan Trip', to: '/trips/new' },
    // admin link will be pushed conditionally below
    { label: 'Profile', to: '/profile' },
  ]

  if (user?.is_admin) {
    navItems.splice(4, 0, { label: 'Admin', to: '/admin' })
  }

  const isAuthRoute =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup')
  const isPublicRoute = location.pathname.startsWith('/p/')

  // Auth and public routes bypass the shell
  if (isAuthRoute || isPublicRoute) {
    return children
  }

  // Protect all other routes: redirect to login if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-shell">
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-logo">
              <img src="/logo.png" alt="GlobeTrotter" className="topbar-logo-img" />
              <div className="logo-text">GlobeTrotter</div>
            </div>
            <nav className="topbar-nav">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    location.pathname === item.to
                      ? 'top-nav-link top-nav-link-active'
                      : 'top-nav-link'
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="topbar-user">
            <div className="user-avatar">{user?.full_name?.[0] || 'U'}</div>
            <span className="user-name">{user?.full_name || user?.email}</span>
            <button className="ghost-btn small" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/p/:slug"
        element={
          <PublicTripPage />
        }
      />

      <Route
        path="/*"
        element={
          <AppShell>
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="admin" element={<AdminPanel/>} />
              <Route path="trips" element={<MyTripsPage />} />
              <Route path="community" element={<CommunityPage />} />
              <Route path="trips/new" element={<CreateTripPage />} />
              <Route path="trips/:tripId" element={<TripPlannerPage mode="edit" />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  )
}

export default App
