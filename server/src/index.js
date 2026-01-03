require('dotenv').config();
const express = require('express');
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const tripRoutes = require('./routes/tripRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

app.use(cors())
// Allow larger JSON bodies for base64 image uploads from the client (adjust as needed)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/trips', tripRoutes)
app.use('/users', userRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`GlobeTrotter API listening on port ${PORT}`)
})
