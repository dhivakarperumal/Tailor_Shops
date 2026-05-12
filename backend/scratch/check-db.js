import { getPool } from '../src/config/db.js'

async function checkDb() {
  try {
    const pool = await getPool()
    const [rows] = await pool.query('SHOW VARIABLES LIKE "max_allowed_packet"')
    console.log('Max Allowed Packet:', rows[0].Value)
    
    const [tables] = await pool.query('SHOW TABLES')
    console.log('Tables:', tables)
    
    const [schema] = await pool.query('DESCRIBE categories')
    console.log('Categories Schema:', schema)
    
    process.exit(0)
  } catch (error) {
    console.error('DB Check Error:', error)
    process.exit(1)
  }
}

checkDb()
