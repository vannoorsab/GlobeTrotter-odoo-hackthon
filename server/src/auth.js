const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { query } = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const JWT_EXP_MINUTES = parseInt(process.env.JWT_EXP_MINUTES || '60', 10)

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: `${JWT_EXP_MINUTES}m`,
  })
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
  return rows[0] || null
}

async function createUser({ fullName, email, password, phone, city, country, about, profile_image_base64 }) {
  const passwordHash = await bcrypt.hash(password, 10)
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, city, country, about, profile_image_data)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, full_name, email, phone, city, country, about, profile_image_data`,
    [fullName, email, passwordHash, phone || null, city || null, country || null, about || null, profile_image_base64 || null],
  )
  return rows[0]
}

module.exports = { authMiddleware, signToken, findUserByEmail, createUser }
