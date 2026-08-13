// core/processManager.ts
// Portal-OS v4.5 — Process Manager scaffold
// Responsibilities:
// - Manage processes triggered by events
// - Provide lifecycle: start, stop, status, checkpoint
// - Map events to Process factories

import { eventBus, type Event } from './eventBus'

/**
 * A Process is a long-lived or short-lived unit of work
 * that reacts to events and may emit new events.
 */
export interface Process {
  id: string
  type: string
  workspace: string

  // Called when the process is started
  start(initialEvent?: Event): Promise<void>

  // Called when the process receives an event
  onEvent(evt: Event): Promise<void>

  // Called when the process is stopped
  stop(reason?: string): Promise<void>

  // Optional checkpointing (persist state to DO/KV)
  checkpoint?(): Promise<void>

  // Optional status reporting
  status?(): Promise<Record<string, any>>
}

/**
 * ProcessFactory: creates a process instance for a given event.
 * This allows dynamic mapping: event.name -> process type.
 */
export type ProcessFactory = (evt: Event) => Process | null

/**
 * ProcessManager: central runtime for managing processes.
 * - subscribes to eventBus
 * - starts/stops processes
 * - routes events to active processes
 */
export class ProcessManager {
  private processes: Map<string, Process> = new Map()
  private factories: Map<string, ProcessFactory> = new Map()

  constructor() {
    // Subscribe to all events from the eventBus
    eventBus.on('*', async (evt) => {
      try {
        await this.handleEvent(evt)
      } catch (err) {
        // best-effort: emit a process manager error event
        try {
          await eventBus.emit({
            name: 'processManager.error',
            payload: { error: String(err), event: evt },
            workspace: evt.workspace,
            timestamp: new Date().toISOString(),
          }, { persist: false })
        } catch (_) {
          // swallow
        }
      }
    })
  }

  /**
   * Register a factory for a given event name.
   * Example: registerFactory('sim.identity.updated', createIdentitySyncProcess)
   */
  registerFactory(eventName: string, factory: ProcessFactory) {
    this.factories.set(eventName, factory)
  }

  /**
   * Handle incoming events:
   * - If a process already exists for this workspace + type, route event to it.
   * - Otherwise, create a new process via factory and start it.
   */
  private async handleEvent(evt: Event) {
    const key = this.processKey(evt)

    // Existing process?
    const existing = this.processes.get(key)
    if (existing) {
      await existing.onEvent(evt)
      return
    }

    // New process?
    const factory = this.factories.get(evt.name)
    if (!factory) return

    const proc = factory(evt)
    if (!proc) return

    this.processes.set(key, proc)

    try {
      await proc.start(evt)
      // Emit a lifecycle event for observability
      await eventBus.emit({
        name: 'process.started',
        payload: { id: proc.id, type: proc.type },
        workspace: proc.workspace,
        timestamp: new Date().toISOString(),
      }, { persist: false })
    } catch (err) {
      // If start failed, cleanup and emit failure
      this.processes.delete(key)
      await eventBus.emit({
        name: 'process.start.failed',
        payload: { error: String(err), id: proc.id, type: proc.type },
        workspace: proc.workspace,
        timestamp: new Date().toISOString(),
      }, { persist: false })
      throw err
    }
  }

  /**
   * Stop a process manually by its processKey (workspace:eventName) or id.
   */
  async stopProcess(keyOrId: string) {
    // attempt by key
    let proc = this.processes.get(keyOrId)
    if (!proc) {
      // search by id
      for (const [k, p] of this.processes.entries()) {
        if (p.id === keyOrId) {
          proc = p
          keyOrId = k
          break
        }
      }
    }
    if (!proc) return
    try {
      await proc.stop('manual-stop')
    } finally {
      this.processes.delete(keyOrId)
      await eventBus.emit({
        name: 'process.stopped',
        payload: { id: proc.id, type: proc.type },
        workspace: proc.workspace,
        timestamp: new Date().toISOString(),
      }, { persist: false })
    }
  }

  /**
   * Get process status.
   */
  async getStatus(keyOrId: string) {
    let proc = this.processes.get(keyOrId)
    if (!proc) {
      for (const p of this.processes.values()) {
        if (p.id === keyOrId) { proc = p; break }
      }
    }
    if (!proc) return null
    return proc.status ? await proc.status() : { id: proc.id, type: proc.type, workspace: proc.workspace }
  }

  /**
   * Generate a unique process key based on workspace + event type.
   * You can refine this later (e.g., multiple processes per workspace).
   */
  private processKey(evt: Event) {
    return `${evt.workspace}:${evt.name}`
  }

  /**
   * List active processes (for admin / introspection)
   */
  listActive(): Array<{ id: string; type: string; workspace: string }> {
    const out: Array<{ id: string; type: string; workspace: string }> = []
    for (const p of this.processes.values()) {
      out.push({ id: p.id, type: p.type, workspace: p.workspace })
    }
    return out
  }
}

// Singleton
export const processManager = new ProcessManager()
