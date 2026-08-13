import { Hono } from 'hono'
import defaultExport from './index'
import { boot as simBoot } from './sim/boot'
import { eventBus } from './core/eventBus'
import { SubstrateDOPublisher } from './substrate/events'
import { adminRouter } from './governance/admin'

export interface Env {
  SUBSTRATE_DO: DurableObjectNamespace
  SUBSTRATE_KV: KVNamespace
  RUNTIME_KV: KVNamespace
  // Optional admin secret for admin endpoints
  SUBSTRATE_ADMIN_SECRET?: string
}

export class SubstrateDO implements DurableObject {
  state: DurableObjectState
  env: Env

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    // Substrate Durable Object endpoint
    const url = new URL(request.url)

    if (url.pathname === '/status') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          object: 'SubstrateDO',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Wire the ingest endpoint to the DO handler if present
    if (url.pathname === '/ingest' && request.method === 'POST') {
      // Importing here avoids circular module resolution at startup in Workers
      const mod = await import('./substrate/events')
      return await mod.handleIngest(request, this.state, this.env as unknown as any)
    }

    return new Response(
      JSON.stringify({ error: 'Not Found', status: 404 }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 404,
      }
    )
  }
}

const app = new Hono()

// Safe lazy attach: Workers reuse module scope but env is only available in request context.
// Use a runtime guard to attach the publisher once per worker instance.
app.use('*', async (c, next) => {
  const env = c.env as unknown as Env

  if (!(eventBus as any).__v45_publisher_attached) {
    try {
      eventBus.attachPersistentPublisher(new SubstrateDOPublisher(env))
      ;(eventBus as any).__v45_publisher_attached = true
    } catch (err) {
      // Emit a non-persistent warning so operators see the issue without blocking requests
      try {
        await eventBus.emit({
          name: 'sim.boot.warn',
          payload: { warning: 'failed to attach SubstrateDOPublisher', error: String(err) },
          workspace: 'default',
          timestamp: new Date().toISOString(),
        }, { persist: false })
      } catch (_) {
        // swallow
      }
    }
  }

  await next()
})

// Internal boot route (deterministic activation)
app.get('/_internal/sim/boot', async (c) => {
  const env = c.env as unknown as Env
  const workspace = c.req.query('workspace') || 'default'

  await simBoot(env as unknown as any, { workspace })

  return c.json({ ok: true, workspace })
})

// Admin routes (governance)
app.route('/admin', adminRouter)

// Existing routes: delegate to original default export for compatibility
app.get('/', async (c) => {
  // Delegate to the original module's fetch handler
  const req = c.req as unknown as Request
  const resp = await (defaultExport as any).fetch(req, c.env)
  return resp
})

app.get('/health', (c) => c.json({ status: 'healthy', service: 'Portal-OS v4.5', timestamp: new Date().toISOString() }))

export default app
