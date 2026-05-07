import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
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

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, phone || null, hashedPassword, role]
    )

    const token = jwt.sign({ id: result.insertId, email, role }, JWT_SECRET, { expiresIn: '24h' })

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: result.insertId, name: username, email, phone, role },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
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
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}