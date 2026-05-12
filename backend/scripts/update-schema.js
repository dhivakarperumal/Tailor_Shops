import { getPool } from '../src/config/db.js'

async function updateSchema() {
  try {
    const pool = await getPool()
    
    // Check if user_id column exists
    let [columns] = await pool.query('SHOW COLUMNS FROM users LIKE "user_id"')

    if (columns.length === 0) {
      console.log('Adding user_id column to users table...')
      await pool.query('ALTER TABLE users ADD COLUMN user_id CHAR(36) NULL AFTER id')
      await pool.query('UPDATE users SET user_id = UUID() WHERE user_id IS NULL OR user_id = ""')
      await pool.query('ALTER TABLE users MODIFY COLUMN user_id CHAR(36) NOT NULL UNIQUE')
      console.log('user_id column added successfully')
    } else {
      console.log('user_id column already exists')
    }

    [columns] = await pool.query('SHOW COLUMNS FROM users LIKE "status"')

    if (columns.length === 0) {
      console.log('Adding status column to users table...')
      await pool.query('ALTER TABLE users ADD COLUMN status ENUM(\'active\',\'inactive\') NOT NULL DEFAULT \'active\' AFTER role')
      console.log('status column added successfully')
    } else {
      console.log('status column already exists')
    }

    // Check if phone column exists
    ;[columns] = await pool.query('SHOW COLUMNS FROM users LIKE "phone"')
    
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
