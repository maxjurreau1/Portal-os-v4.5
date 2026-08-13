import { Hono } from 'hono';

const app = new Hono();

// Runtime ping
app.get('/runtime/ping', (c) => {
  return c.json({ status: "Portal-OS v1 runtime responding" });
});

// SIM.MODE tick
app.get('/sim/tick', (c) => {
  return c.json({ tick: Date.now() });
});

// TEC pipeline trigger
app.post('/tec/run', async (c) => {
  const body = await c.req.json();
  return c.json({ pipeline: body.name, status: "executed" });
});

// Umbrella rule check
app.post('/umbrella/check', async (c) => {
  const rule = await c.req.json();
  return c.json({ rule, valid: true });
});

export default app;