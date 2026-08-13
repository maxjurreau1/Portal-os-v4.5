// governance/policies.ts
// Portal-OS v4.5 — Governance policy registry and runtime enforcement
// Responsibilities:
// - Provide a registry for named policies
// - Evaluate policies per-event and produce allow/block decisions
// - Emit governance audit events (persisted) when policies run
// - Install a lightweight interception layer on eventBus.emit so policies
//   can block or annotate events before they reach consumers (ProcessManager, etc.)

import { eventBus, type Event } from '../core/eventBus'

export type PolicyResult =
  | { allowed: true; metadata?: Record<string, unknown> }
  | { allowed: false; reason?: string; metadata?: Record<string, unknown> }

export type PolicyCallback = (evt: Event) => Promise<PolicyResult> | PolicyResult

export interface Policy {
  id: string
  description?: string
  callback: PolicyCallback
  // lower numbers run first
  priority?: number
}

class PolicyRegistry {
  private policies: Policy[] = []

  register(policy: Policy) {
    this.policies.push(policy)
    // keep policies ordered by priority
    this.policies.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
  }

  unregister(id: string) {
    this.policies = this.policies.filter((p) => p.id !== id)
  }

  list(): Policy[] {
    return [...this.policies]
  }

  async evaluate(evt: Event): Promise<{ allowed: boolean; decisions: Array<{ id: string; result: PolicyResult }> }> {
    const decisions: Array<{ id: string; result: PolicyResult }> = []
    for (const p of this.policies) {
      try {
        const r = await Promise.resolve(p.callback(evt))
        decisions.push({ id: p.id, result: r })
        if (!r.allowed) {
          // short-circuit on first deny
          return { allowed: false, decisions }
        }
      } catch (err) {
        // On error, treat as deny and record reason
        const r: PolicyResult = { allowed: false, reason: `policy_error: ${String(err)}` }
        decisions.push({ id: p.id, result: r })
        return { allowed: false, decisions }
      }
    }
    return { allowed: true, decisions }
  }
}

export const policyRegistry = new PolicyRegistry()

// Keep original emit so audits and system events can bypass governance checks
const originalEmit = eventBus.emit.bind(eventBus)

// Replace eventBus.emit with a guard that evaluates policies before allowing
// the event to be delivered. By default we run policies for all events except
// those emitted with { bypassGovernance: true } in meta.

// We extend the internal emit signature to optionally support bypass via meta
type EmitOpts = { persist?: boolean }

eventBus.emit = async function (evt: Event, opts: EmitOpts = { persist: true }) {
  // If caller explicitly set meta.__bypass_governance, skip checks
  if ((evt as any).meta && (evt as any).meta.__bypass_governance) {
    return originalEmit(evt, opts)
  }

  // Evaluate policies
  const evaluation = await policyRegistry.evaluate(evt)

  // Emit an audit record using the originalEmit (avoid recursing into guarded emit)
  try {
    await originalEmit(
      {
        name: 'governance.audit',
        payload: { event: evt, evaluation },
        workspace: evt.workspace,
        timestamp: new Date().toISOString(),
      },
      { persist: true }
    )
  } catch (auditErr) {
    // swallow audit failures to avoid blocking runtime; but log via a non-persistent event
    try {
      await originalEmit(
        {
          name: 'governance.audit.failed',
          payload: { error: String(auditErr), originalEvent: evt },
          workspace: evt.workspace,
          timestamp: new Date().toISOString(),
        },
        { persist: false }
      )
    } catch (_) {
      // final fallback: nothing
    }
  }

  if (!evaluation.allowed) {
    // Emit a governance.block event (non-persistent) to let local listeners react
    await originalEmit({
      name: 'governance.block',
      payload: { event: evt, decisions: evaluation.decisions },
      workspace: evt.workspace,
      timestamp: new Date().toISOString(),
    }, { persist: false })

    // Return a rejected promise or simply short-circuit without delivering the original event
    // For compatibility with eventBus.emit which returns Promise<void>, just resolve.
    return
  }

  // If allowed, deliver the event normally
  return originalEmit(evt, opts)
} as unknown as typeof eventBus.emit

// Helper to register common policies
export function registerAllowAllPolicy() {
  policyRegistry.register({
    id: 'allow-all',
    description: 'Default allow-all policy for development',
    priority: 1000,
    callback: async () => ({ allowed: true }),
  })
}

// Example of a restrictive policy: prevent process starts for blocked workspaces
export function registerWorkspaceBlockPolicy(blockedWorkspaces: string[]) {
  policyRegistry.register({
    id: 'workspace-block',
    description: 'Blocks events originating from specified workspaces',
    priority: 10,
    callback: async (evt) => {
      if (blockedWorkspaces.includes(evt.workspace || 'default')) {
        return { allowed: false, reason: 'workspace_blocked', metadata: { workspace: evt.workspace } }
      }
      return { allowed: true }
    },
  })
}

// Policy that can be used to intercept process.start intentions — example based on event.name
export function registerProcessStartGuard() {
  policyRegistry.register({
    id: 'process-start-guard',
    description: 'Guard process starts: apply checks before processes are created',
    priority: 20,
    callback: async (evt) => {
      // If the event is trying to start a process (we use event names that are mapped to processes),
      // perform a lightweight check. This is an example; customize per your governance model.
      if (evt.name.startsWith('sim.') || evt.name.startsWith('tec.')) {
        // Example rule: don't allow process starts during a maintenance window
        const hour = new Date().getUTCHours()
        const inMaintenance = false // replace with real schedule check
        if (inMaintenance) {
          return { allowed: false, reason: 'maintenance_mode', metadata: { hour } }
        }
      }
      return { allowed: true }
    },
  })
}

// Initialize default policies for development (allow all) — consumers should replace this with stricter policies
registerAllowAllPolicy()

// Expose API for admin tooling
export const governance = {
  policyRegistry,
  registerAllowAllPolicy,
  registerWorkspaceBlockPolicy,
  registerProcessStartGuard,
}

// Integration notes (how to use):
// - Import this module early in your runtime initialization so it patches eventBus.emit before components attach handlers.
//   Example in src/index.ts middleware: `import './governance/policies'` or dynamic import.
// - To bypass governance for system-internal events (audits, health checks), callers can set evt.meta.__bypass_governance = true
// - Policies should be idempotent, fast, and side-effect free where possible. Use audits for recording decisions.

