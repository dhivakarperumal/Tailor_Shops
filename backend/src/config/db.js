import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const DB_HOST = process.env.DB_HOST ?? 'localhost'
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
const DB_USER = process.env.DB_USER ?? 'root'
const DB_PASSWORD = process.env.DB_PASSWORD ?? ''
const DB_NAME = process.env.DB_NAME ?? 'tailor_shops_db'

export const dbConfig = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

export async function createDatabaseIfNeeded() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD
  })
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``)
  await connection.end()
}

export async function getPool() {
  return mysql.createPool(dbConfig)
}
