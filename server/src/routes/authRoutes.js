const express = require('express')
const router = express.Router()
const { findUserByEmail, createUser, signToken } = require('../auth')
const bcrypt = require('bcryptjs')

router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, phone, city, country, about, profile_image_base64 } = req.body
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' })
    }
    const user = await createUser({ fullName, email, password, phone, city, country, about, profile_image_base64 })
    const token = signToken(user)
    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' })
    }
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = signToken(user)
    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name },
      token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

module.exports = router
