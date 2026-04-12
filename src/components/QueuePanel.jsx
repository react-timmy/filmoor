import { IconCheck, IconWarning, IconError, IconClose, IconFilm, IconTV } from './Icons';

function Spinner({ color = 'var(--gold)', size = 12 }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      border: `2px solid ${color}`, borderTopColor: 'transparent',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    }} />
  );
}

function StatusIcon({ status }) {
  if (status === 'done') return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(61,220,132,0.15)', border: '1px solid rgba(61,220,132,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <IconCheck size={12} color="var(--green)" />
    </div>
  );
  if (status === 'rejected') return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <IconWarning size={12} color="var(--gold)" />
    </div>
  );
  if (status === 'error') return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <IconError size={12} color="#ef4444" />
    </div>
  );
  if (status === 'analyzing' || status === 'checking') return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Spinner color="var(--gold)" size={10} />
    </div>
  );
  // queued
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text3)' }} />
    </div>
  );
}

function formatSize(b) {
  if (!b) return '?';
  if (b > 1e9) return (b/1e9).toFixed(2)+' GB';
  return Math.round(b/1e6)+' MB';
}

export default function QueuePanel({ queue, onDismiss }) {
  if (!queue.length) return null;
  const done = queue.filter(q => q.status === 'done').length;
  const total = queue.length;
  const pct = Math.round((done / total) * 100);
  const circumference = 2 * Math.PI * 12; // r=12

  return (
    <div style={{
      position: 'fixed', bottom: 'calc(var(--nav-bottom) + 12px)', right: 12, zIndex: 1500,
      width: 'min(360px, calc(100vw - 24px)',
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 14, boxShadow: '0 20px 56px rgba(0,0,0,0.7)',
      animation: 'slideUp 0.28s ease', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* Circular progress */}
        <svg width="32" height="32" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
          <circle cx="14" cy="14" r="12" fill="none" stroke="var(--surface2)" strokeWidth="2.5" />
          <circle cx="14" cy="14" r="12" fill="none" stroke="var(--accent)" strokeWidth="2.5"
            strokeDasharray={`${(pct/100)*circumference} ${circumference}`}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
          <text x="14" y="18" textAnchor="middle" fontSize="7" fill="var(--text)" fontFamily="var(--font-mono)" fontWeight="600">{pct}%</text>
        </svg>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Processing Files</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{done}/{total} identified</div>
        </div>

        {done === total && (
          <button onClick={onDismiss} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 10px', color: 'var(--text2)',
            fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <IconClose size={11} color="var(--text2)" /> Dismiss
          </button>
        )}
      </div>

      {/* Queue rows */}
      <div style={{ maxHeight: 260, overflow: 'auto' }}>
        {queue.map((item, i) => (
          <div key={item.id || i} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.03)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <StatusIcon status={item.status} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, color: 'var(--text)', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{item.file?.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>
                {item.status === 'rejected'
                  ? <span style={{ color: 'var(--gold)' }}>{item.rejectReason}</span>
                  : item.status === 'done' && item.parsed
                  ? <><span style={{ color: 'var(--text2)' }}>{item.parsed.title}</span>{item.parsed.year ? ` (${item.parsed.year})` : ''}</>
                  : item.status === 'analyzing' ? 'Identifying...'
                  : item.status === 'checking' ? 'Checking duration...'
                  : item.status === 'error' ? <span style={{ color: '#ef4444' }}>Could not identify</span>
                  : 'Queued'
                }
              </div>
            </div>
            <div style={{ color: 'var(--text3)', fontSize: 10, flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
              {formatSize(item.file?.size)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
