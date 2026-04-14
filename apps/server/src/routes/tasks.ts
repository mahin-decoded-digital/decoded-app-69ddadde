import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const mapDoc = (doc: any) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

router.get('/', async (req, res) => {
  const items = await db.collection('tasks').find()
  res.json(items.map(mapDoc))
})

router.get('/:id', async (req, res) => {
  const item = await db.collection('tasks').findById(req.params.id)
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(mapDoc(item))
})

router.post('/', async (req, res) => {
  const id = await db.collection('tasks').insertOne(req.body)
  const item = await db.collection('tasks').findById(id)
  res.status(201).json(mapDoc(item))
})

router.put('/:id', async (req, res) => {
  const ok = await db.collection('tasks').updateOne(req.params.id, req.body)
  if (!ok) return res.status(404).json({ error: 'Not found' })
  const item = await db.collection('tasks').findById(req.params.id)
  res.json(mapDoc(item))
})

router.delete('/:id', async (req, res) => {
  const ok = await db.collection('tasks').deleteOne(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router