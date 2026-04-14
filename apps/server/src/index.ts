import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db } from './lib/db.js'

import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import projectsRoutes from './routes/projects.js'
import tasksRoutes from './routes/tasks.js'
import filesRoutes from './routes/files.js'

// ── Environment validation ──
const isProd = process.env.PROD === 'true'
const hasMongoUri = !!process.env.MONGODB_URI
console.log('[server] Environment:')
console.log('  PROD (deployment tier):', isProd ? '✓ true' : '✗ false (dev/preview)')
console.log('  MONGODB_URI:', hasMongoUri ? '✓ configured' : '✗ not set (in-memory DB)')
if (isProd && !hasMongoUri) {
  console.warn('[server] ⚠ PROD=true but MONGODB_URI is not set — using in-memory storage')
}

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

// ── Request logging ──
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`[api] ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`)
  })
  next()
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', db: db.isProduction() ? 'mongodb' : 'in-memory' })
})

// --- API routes ---
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/files', filesRoutes)

// ── Error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[server] Error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

// --- DB Seeding ---
async function seedDatabase() {
  try {
    const users = await db.collection('users').find()
    if (users.length === 0) {
      console.log('[server] DB empty. Seeding initial data...')
      
      const INITIAL_USERS = [
        {
          name: 'Alex Rivera',
          email: 'admin@teamsync.com',
          role: 'admin',
          avatarUrl: 'https://i.pravatar.cc/150?u=u1',
        },
        {
          name: 'Sarah Chen',
          email: 'sarah@teamsync.com',
          role: 'manager',
          avatarUrl: 'https://i.pravatar.cc/150?u=u2',
        },
        {
          name: 'Marcus Johnson',
          email: 'marcus@teamsync.com',
          role: 'developer',
          avatarUrl: 'https://i.pravatar.cc/150?u=u3',
        },
      ];
      
      const userIds = []
      for (const u of INITIAL_USERS) {
        const id = await db.collection('users').insertOne(u)
        userIds.push(id)
      }
      
      const INITIAL_PROJECTS = [
        {
          name: 'E-Commerce Platform Redesign',
          description: 'Overhaul the legacy e-commerce platform with a modern React frontend and improved user experience.',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          memberIds: userIds,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          name: 'Mobile App V2',
          description: 'Develop the second version of our iOS and Android applications using React Native.',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'planning',
          memberIds: [userIds[0], userIds[2]],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      const projectIds = []
      for (const p of INITIAL_PROJECTS) {
        const id = await db.collection('projects').insertOne(p)
        projectIds.push(id)
      }
      
      const INITIAL_TASKS = [
        {
          projectId: projectIds[0],
          title: 'Implement Authentication Provider',
          description: 'Set up JWT based authentication and role based routing.',
          assigneeId: userIds[2],
          status: 'done',
          priority: 'high',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          projectId: projectIds[0],
          title: 'Design Checkout Flow',
          description: 'Create wireframes and high-fidelity mockups for the new checkout experience.',
          assigneeId: userIds[1],
          status: 'in-progress',
          priority: 'medium',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          projectId: projectIds[0],
          title: 'Integrate Payment Gateway',
          description: 'Connect Stripe API to the new checkout endpoints.',
          assigneeId: userIds[2],
          status: 'todo',
          priority: 'high',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      for (const t of INITIAL_TASKS) {
        await db.collection('tasks').insertOne(t)
      }
      
      console.log('[server] Seeding complete.')
    }
  } catch (err) {
    console.error('[server] Error seeding database:', err)
  }
}

app.listen(PORT, async () => {
  await seedDatabase()
  console.log(`[server] API server running on http://localhost:${PORT}`)
  console.log(`[server] DB mode: ${db.isProduction() ? 'MongoDB' : 'In-memory'}`)
})

export { app, db }