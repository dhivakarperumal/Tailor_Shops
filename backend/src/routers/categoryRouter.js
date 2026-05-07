import express from 'express'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js'

const router = express.Router()

router.get('/', getCategories)
router.post('/', createCategory)
router.put('/:catId', updateCategory)
router.delete('/:catId', deleteCategory)

export default router
