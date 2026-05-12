import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { getPool } from '../src/config/db.js'

async function seedAdmin() {
  const pool = await getPool()

  const email = 'admin@gmail.com'
  const username = 'Admin'
  const password = 'admin@123'
  const role = 'admin'

  const [existing] = await pool.query('SELECT id, user_id FROM users WHERE email = ? OR name = ?', [email, username])
  if (existing.length > 0) {
    console.log('Admin user already exists:', existing[0])
    await pool.end()
    return
  }

  const userId = crypto.randomUUID()
  const hashedPassword = await bcrypt.hash(password, 10)

  const [result] = await pool.query(
    'INSERT INTO users (user_id, name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, username, email, null, hashedPassword, role, 'active']
  )

  console.log('Admin user created successfully:')
  console.log({ id: result.insertId, user_id: userId, email, name: username, role })
  await pool.end()
}

seedAdmin().catch(error => {
  console.error('Failed to seed admin user:', error)
  process.exit(1)
})
