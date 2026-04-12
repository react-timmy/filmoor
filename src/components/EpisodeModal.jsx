import { useEffect } from 'react';
import { IconClose, IconTV, IconPlay, IconCheck } from './Icons';

export default function EpisodeModal({ series, onClose, onEpisodeClick }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.18s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '18px 18px 0 0', width: '100%', maxWidth: 900,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.28s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 13px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        }}>
          {series.poster
            ? <img src={series.poster} alt={series.title} style={{ width: 44, height: 66, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
            : <div style={{ width: 44, height: 66, background: 'var(--surface)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconTV size={20} color="var(--text3)" />
              </div>
          }
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,4vw,24px)', letterSpacing: 2, color: 'var(--text)' }}>{series.title}</div>
            <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 3 }}>
              Season {series.season} · {series.episodeCount} episode{series.episodeCount !== 1 ? 's' : ''}
              {series.type === 'anime' && <span style={{ color: 'var(--purple)', marginLeft: 8, fontWeight: 600 }}>ANIME</span>}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'var(--surface)', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconClose size={15} color="var(--text2)" />
          </button>
        </div>

        {/* Episode list */}
        <div style={{ overflow: 'auto', flex: 1, paddingBottom: 20 }}>
          {series.episodes.map((ep, i) => (
            <EpisodeRow key={ep.id} ep={ep} index={i} onClick={() => onEpisodeClick(ep)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EpisodeRow({ ep, index, onClick }) {
  const epLabel = `S${String(ep.seasonNumber||1).padStart(2,'0')}E${String(ep.episodeNumber||index+1).padStart(2,'0')}`;

  return (
    <div onClick={onClick} style={{
      display: 'flex', gap: 12, alignItems: 'center',
      padding: '11px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      cursor: 'pointer', transition: 'background 0.13s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Thumbnail */}
      <div style={{
        width: 'clamp(100px,28vw,140px)', flexShrink: 0,
        aspectRatio: '16/9', borderRadius: 7, overflow: 'hidden',
        background: 'var(--bg3)', position: 'relative',
      }}>
        {(ep.backdrop || ep.poster)
          ? <img src={ep.backdrop || ep.poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconTV size={20} color="var(--text3)" />
            </div>
        }
        {ep.watchProgress > 0 && ep.watchProgress < 100 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', width: `${ep.watchProgress}%`, background: 'var(--accent)' }} />
          </div>
        )}
        {ep.status === 'watched' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconCheck size={22} color="var(--green)" />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{epLabel}</span>
          {ep.isMultiEpisode && ep.episodeEnd && (
            <span style={{ fontSize: 9, color: 'var(--gold)', background: 'rgba(245,200,66,0.13)', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>DOUBLE</span>
          )}
          {ep.isSpecial && (
            <span style={{ fontSize: 9, color: 'var(--purple)', background: 'rgba(155,127,232,0.13)', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>SPECIAL</span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
          {ep.episodeTitle || `Episode ${ep.episodeNumber}`}
        </div>
        {ep.durationSeconds && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{Math.round(ep.durationSeconds/60)} min</div>
        )}
      </div>

      {/* Status icon */}
      <div style={{ flexShrink: 0 }}>
        {ep.status === 'watched'
          ? <IconCheck size={16} color="var(--green)" />
          : ep.status === 'watching'
          ? <IconPlay size={14} color="var(--gold)" />
          : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--text3)' }} />
        }
      </div>
    </div>
  );
}
