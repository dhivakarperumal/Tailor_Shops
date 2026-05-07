import { getPool } from '../src/config/db.js'

async function updateSchema() {
  try {
    const pool = await getPool()
    
    // Check if phone column exists
    const [columns] = await pool.query('SHOW COLUMNS FROM users LIKE "phone"')
    
    if (columns.length === 0) {
      console.log('Adding phone column to users table...')
      await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email')
      console.log('Phone column added successfully')
    } else {
      console.log('Phone column already exists')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error updating schema:', error)
    process.exit(1)
  }
}

updateSchema()
