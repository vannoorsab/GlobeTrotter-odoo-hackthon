import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SAMPLE_POSTS = [
  {
    id: '1',
    user: 'Aisha K.',
    city: 'Paris',
    activity: 'Museum hopping',
    title: '3 days in Paris on a budget',
    body: 'Used museum passes and walked between neighborhoods – highly recommend staying near the Latin Quarter.',
    rating: 5,
    tripType: 'budget',
    likes: 34,
    comments: 12,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    user: 'Diego M.',
    city: 'Bali',
    activity: 'Surfing',
    title: 'Best beginner-friendly beaches in Bali',
    body: 'Kuta is busy but great for first timers. Canggu has nicer cafés if you want remote work + surfing.',
    rating: 4,
    tripType: 'adventure',
    likes: 18,
    comments: 5,
    createdAt: '2025-12-20',
  },
  {
    id: '3',
    user: 'Sara L.',
    city: 'Lisbon',
    activity: 'City walking',
    title: '24h layover in Lisbon',
    body: 'Tram 28 is crowded but sunset from Miradouro da Senhora do Monte was worth it.',
    rating: 4,
    tripType: 'budget',
    likes: 22,
    comments: 3,
    createdAt: '2025-11-02',
  },
  {
    id: '4',
    user: 'Kenji',
    city: 'Tokyo',
    activity: 'Food tour',
    title: 'Night food alleys in Tokyo',
    body: 'Omoide Yokocho and Golden Gai are small but packed with character – go early for seats.',
    rating: 5,
    tripType: 'luxury',
    likes: 40,
    comments: 17,
    createdAt: '2025-10-10',
  },
]

function CommunityPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [groupBy, setGroupBy] = useState('none') // none | destination | activity
  const [filterBy, setFilterBy] = useState('all') // all | highRating | budget | luxury | adventure
  const [sortBy, setSortBy] = useState('recent') // recent | likes | comments

  const posts = useMemo(() => {
    const q = search.toLowerCase().trim()
    let list = SAMPLE_POSTS.filter((p) => {
      const text = `${p.city} ${p.activity} ${p.title} ${p.body}`.toLowerCase()
      return !q || text.includes(q)
    })

    if (filterBy === 'highRating') {
      list = list.filter((p) => p.rating >= 4)
    } else if (filterBy === 'budget') {
      list = list.filter((p) => p.tripType === 'budget')
    } else if (filterBy === 'luxury') {
      list = list.filter((p) => p.tripType === 'luxury')
    } else if (filterBy === 'adventure') {
      list = list.filter((p) => p.tripType === 'adventure')
    }

    list = [...list]
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'likes') {
      list.sort((a, b) => b.likes - a.likes)
    } else if (sortBy === 'comments') {
      list.sort((a, b) => b.comments - a.comments)
    }

    // simple grouping hint: sort by destination/activity when chosen
    if (groupBy === 'destination') {
      list.sort((a, b) => a.city.localeCompare(b.city))
    } else if (groupBy === 'activity') {
      list.sort((a, b) => a.activity.localeCompare(b.activity))
    }

    return list
  }, [search, groupBy, filterBy, sortBy])

  return (
    <div className="page community-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Community</h1>
          <p className="page-subtitle">
            Browse shared tips, stories, and reviews from other GlobeTrotter travelers.
          </p>
        </div>
        <button className="secondary-btn" onClick={() => navigate('/trips/new')}>
          Share your own trip
        </button>
      </div>

      <div className="community-layout">
        <section className="card community-main">
          <div className="trips-filter-row">
            <input
              className="input"
              placeholder="Search by city, trip, or activity"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="trips-filter-actions">
              <button
                type="button"
                className="ghost-btn small"
                onClick={() =>
                  setGroupBy((prev) =>
                    prev === 'none' ? 'destination' : prev === 'destination' ? 'activity' : 'none',
                  )
                }
              >
                Group: {groupBy === 'none' ? 'None' : groupBy === 'destination' ? 'Destination' : 'Activity'}
              </button>
              <button
                type="button"
                className="ghost-btn small"
                onClick={() =>
                  setFilterBy((prev) =>
                    prev === 'all'
                      ? 'highRating'
                      : prev === 'highRating'
                      ? 'budget'
                      : prev === 'budget'
                      ? 'luxury'
                      : prev === 'luxury'
                      ? 'adventure'
                      : 'all',
                  )
                }
              >
                Filter: {filterBy}
              </button>
              <button
                type="button"
                className="ghost-btn small"
                onClick={() =>
                  setSortBy((prev) => (prev === 'recent' ? 'likes' : prev === 'likes' ? 'comments' : 'recent'))
                }
              >
                Sort: {sortBy}
              </button>
            </div>
          </div>

          <div className="community-feed">
            {posts.map((p) => (
              <article key={p.id} className="community-card">
                <div className="community-avatar">{p.user[0]}</div>
                <div className="community-body">
                  <div className="community-title-row">
                    <h3 className="community-title">{p.title}</h3>
                    <div className="community-tags">
                      <span className="pill">{p.city}</span>
                      <span className="pill pill-muted">{p.activity}</span>
                    </div>
                  </div>
                  <p className="community-meta">By {p.user} · {p.tripType} · {p.rating}★</p>
                  <p className="community-text">{p.body}</p>
                  <div className="community-actions">
                    <button className="ghost-btn small">Like · {p.likes}</button>
                    <button className="ghost-btn small">Comments · {p.comments}</button>
                    <button className="ghost-btn small">Share</button>
                  </div>
                </div>
              </article>
            ))}

            {posts.length === 0 && <p className="trip-meta">No posts match this search yet.</p>}
          </div>
        </section>

        <aside className="card community-info">
          <h3 className="section-title">About Community</h3>
          <p>
            Share experiences, tips, and stories about trips and activities. Use search,
            group, filter and sort to find posts quickly.
          </p>
          <hr />
          <h4 className="section-title">How to find posts</h4>
          <ul>
            <li>Search by city, activity, or trip name.</li>
            <li>Group by Destination or Activity to browse related posts.</li>
            <li>Filter by rating or trip type to narrow results.</li>
            <li>Sort by recent, most liked, or most commented.</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}

export default CommunityPage
