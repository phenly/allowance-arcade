import { fmtDollar, GOAL } from '../lib/utils'

export default function PaydayModal({ total, baselineEarnings, dailyEarnings, weeklyEarnings, edited = false, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a0533, #0d1a33)',
        border: '1px solid rgba(124,58,237,0.5)',
        borderRadius: '24px',
        padding: '28px 24px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💸</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '4px' }}>Payday!</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Confirm this week's earnings below
          </div>
        </div>

        {/* Breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}>
          {[
            { icon: '⭐', label: 'Base Chores', val: baselineEarnings, color: baselineEarnings > 0 ? '#4ade80' : '#f87171' },
            { icon: '⚡', label: 'Daily Bonus', val: dailyEarnings, color: '#60a5fa' },
            { icon: '🚀', label: 'Weekly Bonus', val: weeklyEarnings, color: '#a78bfa' },
          ].map((row, i) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>{row.icon}</span>
                <span style={{ fontSize: '0.9rem' }}>{row.label}</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: row.color }}>{fmtDollar(row.val)}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'rgba(251,191,36,0.08)',
            borderTop: '1px solid rgba(251,191,36,0.2)',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fbbf24' }}>{fmtDollar(total)}</span>
          </div>
          {edited && (
            <div style={{
              padding: '8px 16px', background: 'rgba(251,191,36,0.08)',
              borderTop: '1px solid rgba(251,191,36,0.15)',
              fontSize: '0.72rem', color: 'rgba(251,191,36,0.8)', textAlign: 'center', fontStyle: 'italic',
            }}>
              ✏️ Total was manually edited — overrides the breakdown above
            </div>
          )}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: '20px' }}>
          This week will be locked and added to the {GOAL.label} savings.
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '14px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 2, padding: '14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              border: 'none',
              color: '#fff', fontSize: '0.95rem', fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            }}
          >
            ✅ Confirm Payday
          </button>
        </div>
      </div>
    </div>
  )
}
