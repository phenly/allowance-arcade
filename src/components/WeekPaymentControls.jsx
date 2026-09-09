import { useState } from 'react'
import { fmtDollar, fmtEditDate, GOAL } from '../lib/utils'
import PaydayModal from './PaydayModal'
import EditTotalModal from './EditTotalModal'

// Shared payment area for a week (used by both the current week and past-week detail).
// Owns the payday confirm, unmark confirm, and the code-gated total-edit flow.
//
// Props:
// - isPaid, computedTotal (button-calculated), effectiveTotalValue (override wins)
// - baselineEarnings/dailyEarnings/weeklyEarnings (breakdown, always button-calculated)
// - overrideTotal, totalEditedAt
// - markPaid/unmarkPaid/saveOverride/clearOverride — the hook callbacks
export default function WeekPaymentControls({
  isPaid,
  computedTotal,
  effectiveTotalValue,
  baselineEarnings,
  dailyEarnings,
  weeklyEarnings,
  overrideTotal,
  totalEditedAt,
  markPaid,
  unmarkPaid,
  saveOverride,
  clearOverride,
}) {
  const [showModal, setShowModal] = useState(false)
  const [showUnmarkConfirm, setShowUnmarkConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const hasOverride = overrideTotal !== null && overrideTotal !== undefined
  const editedNote = totalEditedAt ? `Edited on ${fmtEditDate(totalEditedAt)}` : null

  const handlePayday = async () => {
    // markPaid applies the override internally, so pass the button-calculated total.
    await markPaid(computedTotal, baselineEarnings, dailyEarnings, weeklyEarnings)
    setShowModal(false)
  }

  const handleUnmark = async () => {
    await unmarkPaid()
    setShowUnmarkConfirm(false)
  }

  const handleSaveOverride = async (amount) => {
    await saveOverride(amount)
    setShowEdit(false)
  }

  const handleResetOverride = async () => {
    await clearOverride()
    setShowEdit(false)
  }

  const noteStyle = {
    fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)',
    textAlign: 'center', marginTop: '8px', fontStyle: 'italic',
  }

  return (
    <>
      <div style={{ margin: '0 16px 8px' }}>
        {isPaid ? (
          <>
            <div style={{
              width: '100%', padding: '16px', borderRadius: '14px',
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              textAlign: 'center', fontSize: '1rem', fontWeight: 800, color: '#4ade80',
              marginBottom: '10px',
            }}>
              ✅ Week Paid — {fmtDollar(effectiveTotalValue)}
              {editedNote && (
                <div style={{ ...noteStyle, marginTop: '4px', color: 'rgba(74,222,128,0.6)' }}>
                  {editedNote}
                </div>
              )}
            </div>
            {showUnmarkConfirm ? (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '14px', padding: '16px',
              }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '12px', textAlign: 'center' }}>
                  This will unlock the week for editing and remove{' '}
                  <span style={{ color: '#f87171', fontWeight: 700 }}>{fmtDollar(effectiveTotalValue)}</span>{' '}
                  from the {GOAL.label} paid balance. Continue?
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowUnmarkConfirm(false)}
                    className="tap"
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnmark}
                    className="tap"
                    style={{
                      flex: 1, padding: '12px', borderRadius: '10px',
                      background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
                      color: '#f87171', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Unlock Week
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowUnmarkConfirm(true)}
                className="tap"
                style={{
                  width: '100%', padding: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                🔓 Unmark as Paid
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => setShowModal(true)}
              className="tap"
              style={{
                width: '100%', padding: '16px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                border: 'none', borderRadius: '14px', color: '#fff',
                fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              💸 Mark Week as Paid — {fmtDollar(effectiveTotalValue)}
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="tap"
              style={{
                width: '100%', padding: '10px', marginTop: '8px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: 'rgba(255,255,255,0.5)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              ✏️ Edit total
            </button>
            {editedNote && <div style={noteStyle}>{editedNote}</div>}
          </>
        )}
      </div>

      {showModal && (
        <PaydayModal
          total={effectiveTotalValue}
          edited={hasOverride}
          baselineEarnings={baselineEarnings}
          dailyEarnings={dailyEarnings}
          weeklyEarnings={weeklyEarnings}
          onConfirm={handlePayday}
          onCancel={() => setShowModal(false)}
        />
      )}

      {showEdit && (
        <EditTotalModal
          currentTotal={effectiveTotalValue}
          hasOverride={hasOverride}
          onSave={handleSaveOverride}
          onReset={handleResetOverride}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
