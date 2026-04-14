import { Router } from 'express'
import { db } from '../lib/db.js'

const router = Router()

const mapDoc = (doc: any) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
}

router.post('/login', async (req, res) => {
  const { email } = req.body
  const users = await db.collection('users').find()
  
  const user = users.find(u => (u.email as string).toLowerCase() === email.toLowerCase())
  if (!user) {
    // create simple demo user if not exists
    const newUser = {
      name: email.split('@')[0],
      email,
      role: 'developer',
      avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
      token: Math.random().toString(36).slice(2)
    }
    const id = await db.collection('users').insertOne(newUser)
    const created = await db.collection('users').findById(id)
    return res.json({ user: mapDoc(created), token: newUser.token })
  }
  
  return res.json({ user: mapDoc(user), token: user.token || 'demo-token' })
})

export default router