const express = require('express')
const router = express.Router()
const { query } = require('../db')
const { authMiddleware } = require('../auth')

router.use(authMiddleware)

// GET /users/me
router.get('/me', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, email, full_name, phone, city, country, about, profile_image_data, is_admin FROM users WHERE id = $1',
      [req.user.id],
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load user' })
  }
})

// PUT /users/me
router.put('/me', async (req, res) => {
  try {
    const { full_name, phone, city, country, about, profile_image_base64 } = req.body
    const { rows } = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           city = COALESCE($3, city),
           country = COALESCE($4, country),
           about = COALESCE($5, about),
           profile_image_data = COALESCE($6, profile_image_data),
           updated_at = now()
       WHERE id = $7
       RETURNING id, email, full_name, phone, city, country, about, profile_image_data, is_admin`,
      [full_name || null, phone || null, city || null, country || null, about || null, profile_image_base64 || null, req.user.id],
    )
    res.json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

module.exports = router
