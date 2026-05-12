import { getPool } from '../config/db.js'

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const pool = await getPool()
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY created_at DESC')
    const categories = rows.map(cat => ({
      ...cat,
      images: cat.images ? JSON.parse(cat.images) : [],
      subcategory: cat.subcategory ? JSON.parse(cat.subcategory) : []
    }))
    res.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { catId, name, description, subcategory, images } = req.body
    if (!catId || !name) return res.status(400).json({ error: 'catId and name are required' })

    const pool = await getPool()
    const [result] = await pool.query(
      'INSERT INTO categories (catId, name, description, subcategory, images) VALUES (?, ?, ?, ?, ?)',
      [catId, name, description || null, JSON.stringify(subcategory || []), JSON.stringify(images || [])]
    )
    res.status(201).json({ id: result.insertId, catId, name, description, subcategory, images })
  } catch (error) {
    console.error('Create category error:', error)
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Category ID already exists' })
    res.status(500).json({ error: 'Internal server error', message: error.message, code: error.code })
  }
}

// PUT /api/categories/:catId
export const updateCategory = async (req, res) => {
  try {
    const { catId } = req.params
    const { name, description, subcategory, images } = req.body
    const pool = await getPool()
    await pool.query(
      'UPDATE categories SET name=?, description=?, subcategory=?, images=? WHERE catId=?',
      [name, description || null, JSON.stringify(subcategory || []), JSON.stringify(images || []), catId]
    )
    res.json({ message: 'Category updated successfully' })
  } catch (error) {
    console.error('Update category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/categories/:catId
export const deleteCategory = async (req, res) => {
  try {
    const { catId } = req.params
    const pool = await getPool()
    await pool.query('DELETE FROM categories WHERE catId=?', [catId])
    res.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete category error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
