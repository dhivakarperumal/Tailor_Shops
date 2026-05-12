import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { getPool } from '../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-secret-key'

export const register = async (req, res) => {
  try {
    const { username, email, phone, password, role = 'customer' } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    const pool = await getPool()
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email])

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' })
    }

    const userId = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (user_id, name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, phone || null, hashedPassword, role, 'active']
    )

    const token = jwt.sign({ id: result.insertId, user_id: userId, email, role, status: 'active' }, JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.insertId, user_id: userId, name: username, email, phone, role, status: 'active' },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' })
    }

    const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    if (!tokenInfoResponse.ok) {
      const errorText = await tokenInfoResponse.text()
      console.error('Google token verification failed:', errorText)
      return res.status(401).json({ error: 'Invalid Google credential' })
    }

    const tokenInfo = await tokenInfoResponse.json()
    const googleClientId = process.env.GOOGLE_CLIENT_ID

    if (googleClientId && tokenInfo.aud !== googleClientId) {
      return res.status(401).json({ error: 'Google client ID mismatch' })
    }

    const email = tokenInfo.email
    const name = tokenInfo.name || email.split('@')[0]

    const pool = await getPool()
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email])

    let user
    if (existingUsers.length > 0) {
      user = existingUsers[0]
      if (user.status !== 'active') {
        return res.status(403).json({ error: 'User account is inactive' })
      }
    } else {
      const userId = crypto.randomUUID()
      const randomPassword = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(randomPassword, 10)
      const [result] = await pool.query(
        'INSERT INTO users (user_id, name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, name, email, null, hashedPassword, 'customer', 'active']
      )
      const [newUserRows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId])
      user = newUserRows[0]
    }

    const token = jwt.sign({ id: user.id, user_id: user.user_id, email: user.email, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: 'Google login successful',
      user: { id: user.id, user_id: user.user_id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status },
      token
    })
  } catch (error) {
    console.error('Google login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' })
    }

    const pool = await getPool()
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR name = ?',
      [identifier, identifier]
    )

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = users[0]

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'User account is inactive' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, user_id: user.user_id, email: user.email, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: 'Login successful',
      user: { id: user.id, user_id: user.user_id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}