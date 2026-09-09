import { fmtDollar, GOAL } from '../lib/utils'

export default function GoalBar({ paidSavings = 0, unpaidSavings = 0 }) {
  const total = paidSavings + unpaidSavings
  const remaining = Math.max(GOAL.amount - total, 0)
  const paidPct = Math.min((paidSavings / GOAL.amount) * 100, 100)
  const unpaidPct = Math.min((unpaidSavings / GOAL.amount) * 100, Math.max(0, 100 - paidPct))

  return (
    <div style={{
      margin: '0 16px 16px',
      borderRadius: '16px',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{GOAL.emoji} {GOAL.label}</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textAlign: 'right' }}>
          <span style={{ color: '#fbbf24' }}>{fmtDollar(paidSavings)} paid</span>
          {unpaidSavings > 0 && (
            <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
              {' + '}
              <span style={{ color: '#a78bfa' }}>{fmtDollar(unpaidSavings)} unpaid</span>
            </span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}> / {fmtDollar(GOAL.amount)}</span>
        </div>
      </div>
      <div style={{ height: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
        {/* Gold segment — paid (locked) */}
        {paidPct > 0 && (
          <div style={{
            height: '100%',
            width: `${paidPct}%`,
            background: 'linear-gradient(90deg, #d97706, #fbbf24)',
            borderRadius: unpaidPct > 0 ? '7px 0 0 7px' : '7px',
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 0 12px rgba(251,191,36,0.4)',
            minWidth: '4px',
          }} />
        )}
        {/* Purple segment — unpaid (potential) */}
        {unpaidPct > 0 && (
          <div style={{
            height: '100%',
            width: `${unpaidPct}%`,
            background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
            borderRadius: paidPct > 0 ? '0 7px 7px 0' : '7px',
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: '0 0 12px rgba(124,58,237,0.5)',
            minWidth: '4px',
          }} />
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '6px', textAlign: 'right' }}>
        {fmtDollar(remaining)} to go!
      </div>
    </div>
  )
}
