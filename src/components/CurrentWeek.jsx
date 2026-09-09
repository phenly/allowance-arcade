import { useWeekData } from '../hooks/useWeekData'
import { getTodayIndex, computeEarnings, effectiveTotal } from '../lib/utils'
import Header from './Header'
import EarningsHero from './EarningsHero'
import GoalBar from './GoalBar'
import BaselineSection from './BaselineSection'
import DailyBonusSection from './DailyBonusSection'
import WeeklyBonusSection from './WeeklyBonusSection'
import WeekPaymentControls from './WeekPaymentControls'

export default function CurrentWeek({ weekStart }) {
  const todayIndex = getTodayIndex()
  const {
    baselineChecks, dailyChecks, weeklyChecks,
    isPaid, totalEarned, overrideTotal, totalEditedAt,
    loading, error, ps5PaidSavings, ps5UnpaidSavings,
    toggleBaseline, toggleDaily, toggleWeekly,
    markPaid, unmarkPaid, saveOverride, clearOverride, retry,
  } = useWeekData(weekStart)

  const earnings = computeEarnings({ baselineChecks, dailyChecks, weeklyChecks, todayIndex })
  const { baselineEarnings, dailyEarnings, weeklyEarnings, weeklyMultiplier, weeklyBase, completedWeekly, total, baselineComplete } = earnings

  // Effective total = manual override wins over the button-calculated total.
  const effTotal = effectiveTotal({ overrideTotal, isPaid, storedTotal: totalEarned, computedTotal: total })

  // PS5 bar: paid segment = locked savings; unpaid = all other unpaid weeks plus this
  // week's contribution. An override fixes this week's contribution (chore checks no
  // longer move it); otherwise it's the live button-calculated total.
  const unpaidSavings = ps5UnpaidSavings + (isPaid ? 0 : effTotal)

  if (loading) {
    return (
      <>
        <Header weekStart={weekStart} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '2rem', animation: 'pop 1s ease infinite' }}>🎮</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Loading…</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header weekStart={weekStart} />
        <div style={{ margin: '20px 16px', padding: '20px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px', color: '#f87171' }}>⚠️ Connection Error</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>{error}</div>
          <button
            onClick={retry}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.4)',
              background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontWeight: 700,
              fontSize: '0.9rem', cursor: 'pointer', marginBottom: '16px',
            }}
          >
            Try again
          </button>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
            If this keeps happening, make sure the Supabase project is awake and the database
            tables are set up — run the SQL migration in{' '}
            <code style={{ color: '#a78bfa' }}>supabase/migrations/001_initial.sql</code>.
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header weekStart={weekStart} />

      <EarningsHero
        baselineEarnings={baselineEarnings}
        dailyEarnings={dailyEarnings}
        weeklyEarnings={weeklyEarnings}
        total={total}
        baselineComplete={baselineComplete}
      />

      <GoalBar paidSavings={ps5PaidSavings} unpaidSavings={unpaidSavings} />

      <BaselineSection
        baselineChecks={baselineChecks}
        todayIndex={todayIndex}
        onToggle={toggleBaseline}
        isPaid={isPaid}
        baselineComplete={baselineComplete}
      />

      <DailyBonusSection
        dailyChecks={dailyChecks}
        todayIndex={todayIndex}
        onToggle={toggleDaily}
        isPaid={isPaid}
      />

      <WeeklyBonusSection
        weeklyChecks={weeklyChecks}
        onToggle={toggleWeekly}
        isPaid={isPaid}
        weeklyEarnings={weeklyEarnings}
        weeklyMultiplier={weeklyMultiplier}
        weeklyBase={weeklyBase}
        completedWeekly={completedWeekly}
      />

      <WeekPaymentControls
        isPaid={isPaid}
        computedTotal={total}
        effectiveTotalValue={effTotal}
        baselineEarnings={baselineEarnings}
        dailyEarnings={dailyEarnings}
        weeklyEarnings={weeklyEarnings}
        overrideTotal={overrideTotal}
        totalEditedAt={totalEditedAt}
        markPaid={markPaid}
        unmarkPaid={unmarkPaid}
        saveOverride={saveOverride}
        clearOverride={clearOverride}
      />
    </>
  )
}
