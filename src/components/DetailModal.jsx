import { useState, useEffect } from 'react';
import { getSuggestedPath } from '../utils/parser';
import { IconClose, IconFolder, IconFilm, IconTV, IconStar, IconCheck } from './Icons';

function ConfBar({ value }) {
  const color = value >= 80 ? 'var(--green)' : value >= 50 ? 'var(--gold)' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--surface2)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${value}%`, borderRadius: 2, background: color, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color, width: 34, textAlign: 'right', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{value}%</span>
    </div>
  );
}

export default function DetailModal({ item, onClose, onUpdate }) {
  const [status, setStatus] = useState(item.status || 'unwatched');
  const [stars, setStars] = useState(item.userRating || 0);
  const [hoverStar, setHoverStar] = useState(0);
  const isTV = item.type === 'tv' || item.type === 'anime';

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [onClose]);

  const setStatusAndSave = s => { setStatus(s); onUpdate(item.id, { status: s }); };
  const setStarsAndSave = n => { setStars(n); onUpdate(item.id, { userRating: n }); };

  const path = getSuggestedPath({
    title: item.title, year: item.year, type: item.type,
    seasonNumber: item.seasonNumber, episodeNumber: item.episodeNumber,
    episodeTitle: item.episodeTitle, cleanedFilename: item.cleanedFilename,
    genre: item.genre,
  });

  const statusCfg = {
    unwatched: { label: 'Unwatched', color: 'var(--text3)', activeBg: 'rgba(90,96,112,0.2)' },
    watching:  { label: 'In Progress', color: 'var(--gold)', activeBg: 'rgba(245,200,66,0.15)' },
    watched:   { label: 'Watched', color: 'var(--green)', activeBg: 'rgba(61,220,132,0.15)' },
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.87)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0', animation: 'fadeIn 0.18s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '18px 18px 0 0',
        width: '100%', maxWidth: 760,
        maxHeight: '92vh', overflow: 'auto',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* Backdrop */}
        <div style={{ position: 'relative', height: 'clamp(160px,40vw,220px)', borderRadius: '18px 18px 0 0', overflow: 'hidden', background: 'var(--surface)', flexShrink: 0 }}>
          {item.backdrop
            ? <img src={item.backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,var(--surface),var(--bg3))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isTV ? <IconTV size={48} color="var(--text3)" /> : <IconFilm size={48} color="var(--text3)" />}
              </div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 30%,var(--bg2))' }} />
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.14)', color: 'var(--text2)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconClose size={15} color="var(--text2)" />
          </button>
        </div>

        <div style={{ padding: '0 16px 28px' }}>
          {/* Poster + info */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: -50, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 90, height: 135, borderRadius: 9, flexShrink: 0,
              boxShadow: '0 10px 30px rgba(0,0,0,0.7)', overflow: 'hidden', background: 'var(--surface)',
            }}>
              {item.poster
                ? <img src={item.poster} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isTV ? <IconTV size={28} color="var(--text3)" /> : <IconFilm size={28} color="var(--text3)" />}
                  </div>
              }
            </div>
            <div style={{ flex: 1, paddingTop: 56 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px,5vw,30px)', letterSpacing: 2, lineHeight: 1.05, color: 'var(--text)' }}>
                {item.title}
                {item.year ? <span style={{ color: 'var(--text3)', fontSize: '0.65em', fontWeight: 400 }}> ({item.year})</span> : ''}
              </div>
              {isTV && item.episodeNumber && (
                <div style={{ color: 'var(--purple)', fontSize: 12, marginTop: 4 }}>
                  S{String(item.seasonNumber||1).padStart(2,'0')} · E{String(item.episodeNumber).padStart(2,'0')}
                  {item.episodeTitle ? ` — "${item.episodeTitle}"` : ''}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7, alignItems: 'center' }}>
                {item.genres?.slice(0, 3).map(g => (
                  <span key={g} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border2)', color: 'var(--text2)' }}>{g}</span>
                ))}
                {item.rating && <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>★ {item.rating}</span>}
                {item.runtime && <span style={{ color: 'var(--text3)', fontSize: 12 }}>{Math.floor(item.runtime/60)}h {item.runtime%60}m</span>}
              </div>
            </div>
          </div>

          {/* Overview */}
          {item.overview && (
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.7, marginTop: 14 }}>{item.overview}</p>
          )}

          {/* Status */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 9 }}>Watch Status</div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {Object.entries(statusCfg).map(([k, cfg]) => (
                <button key={k} onClick={() => setStatusAndSave(k)} style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: `1px solid ${status === k ? cfg.color : 'var(--border)'}`,
                  background: status === k ? cfg.activeBg : 'transparent',
                  color: status === k ? cfg.color : 'var(--text3)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  transition: 'all 0.14s', fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {status === k && <IconCheck size={11} color={cfg.color} />}
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Your Rating</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setStarsAndSave(n)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px 2px' }}
                >
                  <IconStar size={24} color="var(--gold)" filled={n <= (hoverStar || stars)} />
                </button>
              ))}
            </div>
          </div>

          {/* Folder path */}
          <div style={{
            marginTop: 20, background: 'rgba(61,220,132,0.05)',
            border: '1px solid rgba(61,220,132,0.14)', borderRadius: 11, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconFolder size={11} color="var(--text3)" /> Suggested Folder Path
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)', wordBreak: 'break-all', lineHeight: 1.55 }}>{path}</div>
            <div style={{ marginTop: 7, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              Original: {item.filename}
            </div>
          </div>

          {/* Parser stats */}
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 9, padding: '11px 13px' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>Parser Confidence</div>
              <ConfBar value={item.confidence} />
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 9, padding: '11px 13px' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 5 }}>Cleaned Name</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text2)', wordBreak: 'break-all', lineHeight: 1.5 }}>{item.cleanedFilename}</div>
            </div>
          </div>

          {/* File meta chips */}
          <div style={{ marginTop: 10, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[
              ['Type', item.type?.toUpperCase()],
              ['Size', item.fileSize ? (item.fileSize > 1e9 ? (item.fileSize/1e9).toFixed(2)+' GB' : Math.round(item.fileSize/1e6)+' MB') : '—'],
              ['Duration', item.durationSeconds ? `${Math.floor(item.durationSeconds/60)} min` : '—'],
              ['Added', item.addedAt ? new Date(item.addedAt).toLocaleDateString() : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'var(--surface)', borderRadius: 7, padding: '6px 11px', fontSize: 11, color: 'var(--text2)' }}>
                <span style={{ color: 'var(--text3)' }}>{label}: </span>{value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
