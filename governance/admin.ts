// governance/admin.ts
// Portal-OS v4.5 — Admin endpoints for governance
// - GET  /admin/policies                 -> list registered policies and runtime knobs
// - POST /admin/policies/block-workspaces -> set blocked workspaces
// - POST /admin/policies/maintenance     -> set/clear maintenance window
// - POST /admin/policies/tool-approval   -> toggle tool invocation approval requirement
// - GET  /admin/policies/audit-log       -> list recent governance.audit entries from SUBSTRATE_KV

import { Router } from 'hono'
import type { Env } from '../src/index'
import { governance, policyRegistry, setBlockedWorkspaces, setMaintenanceWindow, setToolInvocationRequireApproval } from './policies'

const admin = new Router()

// Simple middleware to guard admin routes. In production replace with a proper auth check.
admin.use('*', async (c, next) => {
  const secret = c.req.header('x-portal-admin') || c.req.query('admin_secret')
  // If a secret is configured via env (SUBSTRATE_ADMIN_SECRET), require it.
  const expected = (c.env as unknown as Env)['SUBSTRATE_ADMIN_SECRET'] as string | undefined
  if (expected) {
    if (!secret || secret !== expected) return c.text('unauthorized', 401)
  }
  // Otherwise, allow local access in dev
  await next()
})

// GET /admin/policies
admin.get('/policies', async (c) => {
  const list = policyRegistry.list().map((p) => ({ id: p.id, description: p.description, priority: p.priority }))
  return c.json({ ok: true, policies: list, knobs: {
    blockedWorkspaces: Array.from((governance as any).policyRegistry ? [] : []), // placeholder
  }})
})

// POST /admin/policies/block-workspaces
admin.post('/policies/block-workspaces', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !Array.isArray(body.blocked)) return c.json({ ok: false, error: 'invalid body' }, 400)
  setBlockedWorkspaces(body.blocked)
  return c.json({ ok: true, blocked: body.blocked })
})

// POST /admin/policies/maintenance
admin.post('/policies/maintenance', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ ok: false, error: 'invalid body' }, 400)
  const { startHour, endHour } = body
  if (startHour === null || endHour === null) {
    setMaintenanceWindow(null as any, null as any)
    return c.json({ ok: true, maintenance: null })
  }
  if (typeof startHour !== 'number' || typeof endHour !== 'number') return c.json({ ok: false, error: 'invalid hours' }, 400)
  setMaintenanceWindow(startHour, endHour)
  return c.json({ ok: true, maintenance: { startHour, endHour } })
})

// POST /admin/policies/tool-approval
admin.post('/policies/tool-approval', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.requireApproval !== 'boolean') return c.json({ ok: false, error: 'invalid body' }, 400)
  setToolInvocationRequireApproval(body.requireApproval)
  return c.json({ ok: true, requireApproval: body.requireApproval })
})

// GET /admin/policies/audit-log
admin.get('/policies/audit-log', async (c) => {
  const env = c.env as unknown as Env
  const workspace = c.req.query('workspace') || 'default'
  // Read recent audit entries from SUBSTRATE_KV. We assume keys like audit:<workspace>:<ts>...
  if (!env.SUBSTRATE_KV) return c.json({ ok: false, error: 'SUBSTRATE_KV not bound' }, 500)

  // This is a simple scan: in production, use a structured index or pagination
  const prefix = `audit:${workspace}:`
  const items: Array<{ key: string; value: string }> = []
  try {
    // @ts-ignore kv.list is available in some Workers runtimes; if unavailable, return a not-implemented response
    if (typeof (env.SUBSTRATE_KV as any).list === 'function') {
      // list pages through results (limit to 100)
      // @ts-ignore
      const iter = (env.SUBSTRATE_KV as any).list({ prefix })
      for await (const page of iter) {
        for (const r of page) {
          items.push({ key: r.name || r.key || 'unknown', value: r.value || r.body || '' })
          if (items.length >= 100) break
        }
        if (items.length >= 100) break
      }
    } else {
      return c.json({ ok: false, error: 'KV list not supported in this runtime' }, 501)
    }
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500)
  }

  return c.json({ ok: true, items })
})

export const adminRouter = admin
