import { Hono } from 'hono'
import defaultExport from './index'
import { boot as simBoot } from './sim/boot'
import { eventBus } from './core/eventBus'
import { SubstrateDOPublisher } from './substrate/events'
import { adminRouter } from './governance/admin'
import { processManager } from './core/processManager'
import { listMappings } from './governance/criticalityRegistry'

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

    // Ensure reactive governance listeners are registered before loading config
    try {
      await import('./governance/reactive')
    } catch (err) {
      try {
        await eventBus.emit({
          name: 'governance.reactive.load.failed',
          payload: { error: String(err) },
          workspace: 'default',
          timestamp: new Date().toISOString(),
          meta: { __bypass_governance: true } as any,
        }, { persist: false })
      } catch (_) {}
    }

    // Load durable governance config once per worker instance
    try {
      await import('./governance/config').then(m => m.loadGovernanceConfig(env as unknown as any))
    } catch (err) {
      // non-fatal: emit warning so operators see the problem
      try {
        await eventBus.emit({
          name: 'governance.config.load.failed',
          payload: { error: String(err) },
          workspace: 'default',
          timestamp: new Date().toISOString(),
          meta: { __bypass_governance: true } as any,
        }, { persist: false })
      } catch (_) {}
    }

    // Register canonical criticality mappings into the processManager type registry
    try {
      const { canonical } = listMappings()
      for (const [typePattern, crit] of Object.entries(canonical)) {
        // register only exact mappings (skip prefix entries that end with '.')
        if (!typePattern.endsWith('.')) {
          processManager.registerProcessType(typePattern, crit as any)
        }
      }
    } catch (err) {
      try {
        await eventBus.emit({ name: 'processManager.register.defaults.failed', payload: { error: String(err) }, workspace: 'default', timestamp: new Date().toISOString() }, { persist: false })
      } catch (_) {}
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
