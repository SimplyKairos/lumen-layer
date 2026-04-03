import Fastify from 'fastify'
import cors from '@fastify/cors'

const server = Fastify({ logger: true })

server.register(cors, {
  origin: '*'
})

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// PROTOCOL ROUTES
// POST /api/v1/stamp — submit a transaction for receipt generation
server.post('/api/v1/stamp', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// GET /api/v1/verify/:receiptId — verify a receipt
server.get('/api/v1/verify/:receiptId', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// GET /api/v1/receipts — list recent receipts
server.get('/api/v1/receipts', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// LAUNCHPAD ROUTES
// POST /api/v1/launch — create a new token launch
server.post('/api/v1/launch', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// GET /api/v1/launches — list all launches
server.get('/api/v1/launches', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// GET /api/v1/launches/:launchId — get a specific launch
server.get('/api/v1/launches/:launchId', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// CREATOR ROUTES
// GET /api/v1/creators/:walletAddress — get creator profile
server.get('/api/v1/creators/:walletAddress', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// WEBHOOK ROUTE
// POST /api/v1/webhook — webhook for external integrators
server.post('/api/v1/webhook', async (request, reply) => {
  return reply.code(501).send({ error: 'not implemented yet' })
})

// Start server
const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Lumen API running on port 3001')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()