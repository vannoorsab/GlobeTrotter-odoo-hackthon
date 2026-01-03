const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { authMiddleware } = require('../auth')

// All routes here require auth
router.use(authMiddleware)

// List trips for current user
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT t.id, t.name, t.start_date, t.end_date, t.cover_image_url,
              COALESCE(SUM(ta.cost),0) + COALESCE(SUM(e.amount),0) AS estimated_total_cost,
              COUNT(DISTINCT ts.id) AS city_count
       FROM trips t
       LEFT JOIN trip_stops ts ON ts.trip_id = t.id
       LEFT JOIN trip_activities ta ON ta.trip_stop_id = ts.id
       LEFT JOIN expenses e ON e.trip_id = t.id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.start_date ASC`,
      [req.user.id],
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to list trips' })
  }
})

// Create trip
router.post('/', async (req, res) => {
  try {
    const { name, start_date, end_date, description, cover_image_url, budget_total } = req.body
    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing name or dates' })
    }
    const { rows } = await query(
      `INSERT INTO trips (user_id, name, start_date, end_date, description, cover_image_url, budget_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [req.user.id, name, start_date, end_date, description || null, cover_image_url || null, budget_total || null],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create trip' })
  }
})

// Update trip meta
router.put('/:id', async (req, res) => {
  const tripId = req.params.id
  const { name, start_date, end_date, description, cover_image_url, budget_total } = req.body

  if (!name || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing name or dates' })
  }

  try {
    const { rows } = await query(
      `UPDATE trips
       SET name = $1,
           start_date = $2,
           end_date = $3,
           description = $4,
           cover_image_url = $5,
           budget_total = $6,
           updated_at = now()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        name,
        start_date,
        end_date,
        description || null,
        cover_image_url || null,
        budget_total || null,
        tripId,
        req.user.id,
      ],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update trip' })
  }
})

// Add a city stop (section) to a trip
router.post('/:id/stops', async (req, res) => {
  const tripId = req.params.id
  const { city_name, country, start_date, end_date, notes } = req.body

  if (!city_name || !country || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing city, country or dates' })
  }

  try {
    // Ensure trip belongs to current user
    const { rowCount: ownsTrip } = await query('SELECT 1 FROM trips WHERE id = $1 AND user_id = $2', [
      tripId,
      req.user.id,
    ])
    if (ownsTrip === 0) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    // Find or create the city
    let cityId
    const existingCity = await query('SELECT id FROM cities WHERE name = $1 AND country = $2 LIMIT 1', [
      city_name,
      country,
    ])
    if (existingCity.rows.length > 0) {
      cityId = existingCity.rows[0].id
    } else {
      const insertedCity = await query(
        'INSERT INTO cities (name, country, popularity_score, cost_index, timezone) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [city_name, country, 50, 50, 'UTC'],
      )
      cityId = insertedCity.rows[0].id
    }

    // Determine next position within the trip
    const { rows: posRows } = await query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM trip_stops WHERE trip_id = $1',
      [tripId],
    )
    const nextPos = posRows[0].next_pos || 1

    const { rows } = await query(
      `INSERT INTO trip_stops (trip_id, city_id, position, start_date, end_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [tripId, cityId, nextPos, start_date, end_date, notes || null],
    )

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add stop' })
  }
})

// Update a stop
router.put('/:tripId/stops/:stopId', async (req, res) => {
  const { tripId, stopId } = req.params
  const { city_name, country, start_date, end_date, notes } = req.body

  if (!city_name || !country || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing city, country or dates' })
  }

  try {
    // Ensure trip belongs to user
    const owns = await query('SELECT 1 FROM trips WHERE id = $1 AND user_id = $2', [
      tripId,
      req.user.id,
    ])
    if (owns.rowCount === 0) return res.status(404).json({ error: 'Trip not found' })

    // Find or create city
    let cityId
    const existingCity = await query('SELECT id FROM cities WHERE name = $1 AND country = $2 LIMIT 1', [
      city_name,
      country,
    ])
    if (existingCity.rows.length > 0) {
      cityId = existingCity.rows[0].id
    } else {
      const insertedCity = await query(
        'INSERT INTO cities (name, country, popularity_score, cost_index, timezone) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [city_name, country, 50, 50, 'UTC'],
      )
      cityId = insertedCity.rows[0].id
    }

    const { rows } = await query(
      `UPDATE trip_stops
       SET city_id = $1,
           start_date = $2,
           end_date = $3,
           notes = $4,
           updated_at = now()
       WHERE id = $5 AND trip_id = $6
       RETURNING *`,
      [cityId, start_date, end_date, notes || null, stopId, tripId],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Stop not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update stop' })
  }
})

// Delete a stop
router.delete('/:tripId/stops/:stopId', async (req, res) => {
  const { tripId, stopId } = req.params
  try {
    const owns = await query('SELECT 1 FROM trips WHERE id = $1 AND user_id = $2', [
      tripId,
      req.user.id,
    ])
    if (owns.rowCount === 0) return res.status(404).json({ error: 'Trip not found' })

    const { rowCount } = await query('DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2', [
      stopId,
      tripId,
    ])
    if (rowCount === 0) return res.status(404).json({ error: 'Stop not found' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete stop' })
  }
})

// Get single trip with stops and basic activities
router.get('/:id', async (req, res) => {
  const tripId = req.params.id
  try {
    const { rows: trips } = await query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [tripId, req.user.id])
    const trip = trips[0]
    if (!trip) return res.status(404).json({ error: 'Not found' })

    const { rows: stops } = await query(
      `SELECT ts.*, c.name AS city_name, c.country AS city_country
       FROM trip_stops ts
       LEFT JOIN cities c ON c.id = ts.city_id
       WHERE ts.trip_id = $1
       ORDER BY ts.position ASC`,
      [tripId],
    )

    const stopIds = stops.map((s) => s.id)
    let activities = []
    if (stopIds.length > 0) {
      const result = await query(
        `SELECT ta.*, a.name, a.category
         FROM trip_activities ta
         JOIN activities a ON a.id = ta.activity_id
         WHERE ta.trip_stop_id = ANY($1::uuid[])`,
        [stopIds],
      )
      activities = result.rows
    }

    res.json({ trip, stops, activities })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load trip' })
  }
})

// Share a trip (generate public slug)
router.post('/:id/share', async (req, res) => {
  const tripId = req.params.id
  try {
    // Ensure trip belongs to user
    const { rows: trips } = await query('SELECT * FROM trips WHERE id = $1 AND user_id = $2', [
      tripId,
      req.user.id,
    ])
    const trip = trips[0]
    if (!trip) return res.status(404).json({ error: 'Not found' })

    let slug = trip.share_slug
    if (!slug) {
      // generate simple random slug
      slug = Math.random().toString(36).slice(2, 9)
      await query('UPDATE trips SET share_slug = $1, is_public = TRUE, updated_at = now() WHERE id = $2', [
        slug,
        tripId,
      ])
    }

    const publicUrl = `/p/${slug}`
    res.json({ share_slug: slug, public_url: publicUrl })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to share trip' })
  }
})

// Delete a trip
router.delete('/:id', async (req, res) => {
  const tripId = req.params.id
  try {
    const { rowCount } = await query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [tripId, req.user.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' })
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete trip' })
  }
})

module.exports = router
