import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'tailor_shops_db'
})

const [rows] = await conn.query('SHOW COLUMNS FROM users')
console.log(rows)
await conn.end()
