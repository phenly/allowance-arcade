// Date utilities

// First Monday of tracked history — the Monday of the week containing March 1, 2026
// (March 1, 2026 is a Sunday, so week starts Feb 23, 2026)
export const HISTORY_START = '2026-02-23'

// Returns all Monday week-start strings from HISTORY_START to the current week, descending
export function getAllWeeks(today = new Date()) {
  const weeks = []
  const current = getWeekStart(today)
  const start = new Date(HISTORY_START + 'T00:00:00')
  let d = new Date(current)
  while (d >= start) {
    weeks.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() - 7)
  }
  return weeks
}

// Returns the most recent Monday as a Date object
export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

// Returns YYYY-MM-DD string for a given week's Monday
export function getWeekStartStr(date = new Date()) {
  return getWeekStart(date).toISOString().split('T')[0]
}

// Returns "Mar 3 – Mar 9, 2025" format
export function formatWeekRange(weekStartStr) {
  const start = new Date(weekStartStr + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const year = end.getFullYear()
  return `${fmt(start)} – ${fmt(end)}, ${year}`
}

// Returns 0=Mon, 1=Tue, ..., 6=Sun for today
export function getTodayIndex() {
  const day = new Date().getDay() // 0=Sun, 1=Mon ... 6=Sat
  return day === 0 ? 6 : day - 1
}

// Format a number as $X.XX
export function fmtDollar(val) {
  if (val === null || val === undefined) return ''
  return `$${Math.abs(val).toFixed(2)}`
}

// The code required to edit a week's total (UI gate, not real security)
export const EDIT_CODE = '4120'

// A week's effective total: a manual override wins over the paid/computed total.
// Used everywhere a week's total is displayed or aggregated (paid button, progress
// bar, history total, PS5 savings). The section breakdown stays button-calculated.
export function effectiveTotal({ overrideTotal, isPaid, storedTotal, computedTotal }) {
  if (overrideTotal !== null && overrideTotal !== undefined) return Number(overrideTotal)
  if (isPaid) return Number(storedTotal ?? computedTotal ?? 0)
  return Number(computedTotal ?? 0)
}

// Format an edit timestamp as "MM/DD/YYYY" (returns '' if absent).
// Postgres/PostgREST returns e.g. "2026-07-07 18:01:23.594+00", which iOS Safari
// won't parse — normalize it to ISO 8601 before falling back to a plain Date parse.
export function fmtEditDate(ts) {
  if (!ts) return ''
  let d = new Date(ts)
  if (Number.isNaN(d.getTime())) {
    const iso = String(ts).replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')
    d = new Date(iso)
  }
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${d.getFullYear()}`
}

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMIZE HERE — this block is the whole "clone and make it yours" surface.
// Change the chores, icons, dollar values, level curve and goal below and the
// arcade retargets to your kid. (One caveat: the three BASELINE_CHORES ids —
// 'bed'/'room'/'laundry' — are also referenced by name in computeEarnings()
// and in useWeekData's EMPTY_* maps, so renaming a baseline id means updating
// those two spots too. Daily/weekly bonus ids are data-driven and safe to edit.)
// ─────────────────────────────────────────────────────────────────────────
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const BASELINE_CHORES = [
  { id: 'bed', icon: '🛏️', label: 'Make Bed', daily: true },
  { id: 'room', icon: '🧹', label: 'Clean Room', daily: true },
  { id: 'laundry', icon: '👕', label: 'Put Away Laundry', daily: false },
]

export const DAILY_BONUS = [
  { id: 'poop', icon: '💩', label: 'Dog Poop', rates: [0.10, 0.25, 0.50, 1.00, 2.00, 4.00, 8.00] },
  { id: 'dish', icon: '🍽️', label: 'Dishwasher', rates: [0.05, 0.13, 0.25, 0.50, 1.00, 2.00, 4.00] },
  { id: 'table', icon: '🥄', label: 'Set Table', rates: [0.05, 0.13, 0.25, 0.50, 1.00, 2.00, 4.00] },
]

export const LEVEL_LABELS = ['—', 'LVL 1', 'LVL 2', 'LVL 3', 'LVL 4', 'LVL 5', 'LVL 6', 'MAX!']
export const LEVEL_COLORS = ['#374151', '#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#fbbf24']

export const WEEKLY_BONUS = [
  { id: 'mow', icon: '🌿', label: 'Mow / Rake / Shovel', value: 1.50 },
  { id: 'trash', icon: '🗑️', label: 'Take Out Trash', value: 0.75 },
  { id: 'tp', icon: '🧻', label: 'Restock Toilet Paper', value: 0.50 },
  { id: 'groceries', icon: '🛒', label: 'Put Away Groceries', value: 0.75 },
]

// The savings goal the arcade counts toward. Retarget it at anything — a bike,
// a trip, a game console — by changing these three fields; nothing else needs to
// know what the goal is.
export const GOAL = {
  label: 'PS5 Quest', // shown on the progress bar
  emoji: '🎮',
  amount: 600,        // dollar target
}

// Compute earnings from current state
export function computeEarnings({ baselineChecks, dailyChecks, weeklyChecks, todayIndex }) {
  // Baseline: all daily chores checked Mon-today AND laundry done
  const bedDone = baselineChecks.bed.slice(0, todayIndex + 1).every(Boolean)
  const roomDone = baselineChecks.room.slice(0, todayIndex + 1).every(Boolean)
  const laundryDone = baselineChecks.laundry
  const baselineEarned = bedDone && roomDone && laundryDone

  // Daily bonus: cumulative by days checked
  const dailyEarnings = DAILY_BONUS.reduce((total, chore) => {
    const days = dailyChecks[chore.id].filter(Boolean).length
    return total + (days > 0 ? chore.rates[days - 1] : 0)
  }, 0)

  // Weekly bonus: multiplier mechanic
  const completedWeekly = WEEKLY_BONUS.filter((c) => weeklyChecks[c.id])
  const multiplier = completedWeekly.length
  const weeklyBase = completedWeekly.reduce((s, c) => s + c.value, 0)
  const weeklyEarnings = weeklyBase * multiplier

  return {
    baselineEarnings: baselineEarned ? 5 : 0,
    baselineComplete: baselineEarned,
    dailyEarnings,
    weeklyEarnings,
    weeklyMultiplier: multiplier,
    weeklyBase,
    completedWeekly,
    total: (baselineEarned ? 5 : 0) + dailyEarnings + weeklyEarnings,
  }
}

// For a daily bonus chore, compute per-day display values
export function computeDayValues(checked, rates, todayIndex) {
  let slot = 0
  return checked.map((isChecked, i) => {
    if (isChecked) {
      const val = { val: rates[slot], type: 'checked' }
      slot++
      return val
    } else if (i <= todayIndex) {
      return { val: 0, type: 'missed' }
    } else {
      const val = { val: slot < 7 ? rates[slot] : null, type: 'future' }
      slot++
      return val
    }
  })
}
