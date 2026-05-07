import { getPool } from '../config/db.js'

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const pool = await getPool()
    const [rows] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    )
    const orders = rows.map(order => ({
      ...order,
      items: order.items ? JSON.parse(order.items) : [],
      delivery_address: order.delivery_address ? JSON.parse(order.delivery_address) : null
    }))
    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params
    const pool = await getPool()
    const [rows] = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' })
    const order = {
      ...rows[0],
      items: rows[0].items ? JSON.parse(rows[0].items) : [],
      delivery_address: rows[0].delivery_address ? JSON.parse(rows[0].delivery_address) : null
    }
    res.json(order)
  } catch (error) {
    console.error('Get order by id error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { user_id, items, total_amount, status, payment_method, delivery_address } = req.body
    if (!items || !total_amount) return res.status(400).json({ error: 'items and total_amount are required' })

    const pool = await getPool()
    const [result] = await pool.query(
      'INSERT INTO orders (user_id, items, total_amount, status, payment_method, delivery_address) VALUES (?, ?, ?, ?, ?, ?)',
      [
        user_id || null,
        JSON.stringify(items),
        total_amount,
        status || 'Order Placed',
        payment_method || 'COD',
        delivery_address ? JSON.stringify(delivery_address) : null
      ]
    )
    res.status(201).json({ id: result.insertId, message: 'Order created successfully' })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const pool = await getPool()
    await pool.query('UPDATE orders SET status=? WHERE id=?', [status, id])
    res.json({ message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/orders/user/:userId
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params
    const pool = await getPool()
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    const orders = rows.map(order => ({
      ...order,
      items: order.items ? JSON.parse(order.items) : [],
      delivery_address: order.delivery_address ? JSON.parse(order.delivery_address) : null
    }))
    res.json(orders)
  } catch (error) {
    console.error('Get orders by user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
