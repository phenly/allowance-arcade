// Demo backend — a local, no-network stand-in for the Supabase client.
//
// When the app runs without Supabase credentials (VITE_DEMO_MODE=true, or the
// public deployment where no VITE_SUPABASE_* is set), lib/supabase.js hands the
// app THIS object instead of a real Supabase client. It implements just the slice
// of the supabase-js surface that useWeekData.js actually calls — enough that the
// whole app runs unchanged against browser-local data.
//
// Data lives in localStorage, seeded once with a few sample weeks so a first-time
// visitor lands on a populated, playable arcade. Nothing leaves the browser; there
// is no real database to reach, so a visitor can never touch anyone else's history.

import { getWeekStartStr, getWeekStart } from './utils'

const STORE_KEY = 'allowance-arcade-demo-v1'

// --- Seed data -------------------------------------------------------------

// N most recent Mondays as YYYY-MM-DD, newest first.
function recentMondays(n) {
  const out = []
  const monday = getWeekStart(new Date())
  for (let i = 0; i < n; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() - i * 7)
    out.push(getWeekStartStr(d))
  }
  return out
}

// Build a believable starter arcade: two older PAID weeks (so the goal bar shows
// locked savings), a couple of unpaid past weeks, and a live current week mid-play.
function buildSeed() {
  const [wk0, wk1, wk2, wk3] = recentMondays(4) // wk0 = current week
  const days = (arr) => arr // readability helper for [Mon..Sun] arrays

  const baseline_checks = []
  const daily_bonus_checks = []
  const weekly_bonus_checks = []
  const now = new Date().toISOString()

  const addBaseline = (week, choreId, dayFlags) => {
    if (choreId === 'laundry') {
      baseline_checks.push({ week_start: week, chore_id: 'laundry', day_index: -1, checked: !!dayFlags, updated_at: now })
    } else {
      dayFlags.forEach((checked, day_index) =>
        baseline_checks.push({ week_start: week, chore_id: choreId, day_index, checked, updated_at: now }))
    }
  }
  const addDaily = (week, choreId, dayFlags) =>
    dayFlags.forEach((checked, day_index) =>
      daily_bonus_checks.push({ week_start: week, chore_id: choreId, day_index, checked, updated_at: now }))
  const addWeekly = (week, choreId, checked) =>
    weekly_bonus_checks.push({ week_start: week, chore_id: choreId, checked, updated_at: now })

  const T = true, F = false

  // --- wk2 (paid): a strong week ---
  addBaseline(wk2, 'bed', days([T, T, T, T, T, T, T]))
  addBaseline(wk2, 'room', days([T, T, T, T, T, T, T]))
  addBaseline(wk2, 'laundry', T)
  addDaily(wk2, 'poop', days([T, T, T, T, T, F, F]))   // 5 days
  addDaily(wk2, 'dish', days([T, T, T, F, F, F, F]))   // 3 days
  addWeekly(wk2, 'mow', T)
  addWeekly(wk2, 'trash', T)

  // --- wk1 (paid): a lighter week ---
  addBaseline(wk1, 'bed', days([T, T, T, T, T, T, T]))
  addBaseline(wk1, 'room', days([T, T, T, T, T, T, T]))
  addBaseline(wk1, 'laundry', T)
  addDaily(wk1, 'poop', days([T, T, T, F, F, F, F]))   // 3 days
  addWeekly(wk1, 'trash', T)

  // --- wk3 (unpaid, past): partial ---
  addBaseline(wk3, 'bed', days([T, T, T, T, F, F, F]))
  addDaily(wk3, 'table', days([T, T, F, F, F, F, F]))

  // --- wk0 (current, unpaid): mid-play so "This Week" looks alive ---
  addBaseline(wk0, 'bed', days([T, T, T, F, F, F, F]))
  addBaseline(wk0, 'room', days([T, T, F, F, F, F, F]))
  addDaily(wk0, 'poop', days([T, T, T, F, F, F, F]))
  addWeekly(wk0, 'trash', T)

  const weeks = [
    { week_start: wk2, is_paid: true, paid_at: now, total_earned: 21.5, baseline_earned: 5, daily_earned: 3.25, weekly_earned: 4.5, created_at: now },
    { week_start: wk1, is_paid: true, paid_at: now, total_earned: 5.75, baseline_earned: 5, daily_earned: 0.5, weekly_earned: 0.75, created_at: now },
  ]

  return { weeks, baseline_checks, daily_bonus_checks, weekly_bonus_checks }
}

// --- Store -----------------------------------------------------------------

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupt or unavailable storage — fall through to a fresh seed
  }
  const seed = buildSeed()
  saveStore(seed)
  return seed
}

function saveStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch {
    // storage full or blocked (e.g. private mode) — demo still works in-memory
  }
}

// Compare a row's value to a filter value (booleans/strings/numbers compare directly).
const matches = (row, filters) => filters.every(([col, val]) => row[col] === val)
const matchesIn = (row, col, vals) => vals.includes(row[col])

// Parse an onConflict key spec ("week_start,chore_id,day_index") into columns.
function conflictKeys(table, opts) {
  if (opts?.onConflict) return opts.onConflict.split(',').map((s) => s.trim())
  const defaults = {
    weeks: ['week_start'],
    baseline_checks: ['week_start', 'chore_id', 'day_index'],
    daily_bonus_checks: ['week_start', 'chore_id', 'day_index'],
    weekly_bonus_checks: ['week_start', 'chore_id'],
  }
  return defaults[table] || ['week_start']
}

// --- Query builder ---------------------------------------------------------

// A thenable builder mirroring supabase-js: .select().eq().in().maybeSingle() all
// resolve to { data, error }. Only the methods useWeekData relies on are implemented.
class QueryBuilder {
  constructor(table) {
    this.table = table
    this._filters = []   // [col, value] equality filters (AND)
    this._in = null      // { col, vals }
    this._single = false
  }

  select() { return this } // column projection is ignored — we return whole rows

  eq(col, val) { this._filters.push([col, val]); return this }

  in(col, vals) { this._in = { col, vals }; return this }

  maybeSingle() { this._single = true; return this }

  _run() {
    const store = loadStore()
    let rows = (store[this.table] || []).filter((r) => matches(r, this._filters))
    if (this._in) rows = rows.filter((r) => matchesIn(r, this._in.col, this._in.vals))
    if (this._single) return { data: rows[0] ?? null, error: null }
    return { data: rows, error: null }
  }

  // Thenable: `await builder` and `builder.then(cb)` both yield { data, error }.
  then(onFulfilled, onRejected) {
    return Promise.resolve(this._run()).then(onFulfilled, onRejected)
  }

  upsert(payload, opts) {
    const store = loadStore()
    const rows = Array.isArray(payload) ? payload : [payload]
    const keys = conflictKeys(this.table, opts)
    const table = (store[this.table] ||= [])

    for (const incoming of rows) {
      const idx = table.findIndex((r) => keys.every((k) => r[k] === incoming[k]))
      if (idx >= 0) {
        // Merge provided fields into the existing row (supabase upsert semantics:
        // columns absent from the payload are left untouched).
        table[idx] = { ...table[idx], ...incoming }
      } else {
        table.push({ ...incoming })
      }
    }
    saveStore(store)
    return Promise.resolve({ data: rows, error: null })
  }
}

// A no-op realtime channel. The demo is single-device, and useWeekData already
// applies optimistic updates locally, so live cross-device sync isn't needed.
function makeChannel() {
  const channel = { on: () => channel, subscribe: () => channel }
  return channel
}

// --- Public factory --------------------------------------------------------

export function createDemoClient() {
  return {
    from: (table) => new QueryBuilder(table),
    channel: () => makeChannel(),
    removeChannel: () => {},
  }
}

// Wipe the demo store (used by the "Reset demo" control). Next load re-seeds.
export function resetDemo() {
  try { localStorage.removeItem(STORE_KEY) } catch { /* ignore */ }
}
