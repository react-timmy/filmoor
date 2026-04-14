import { useState, useRef } from 'react';
import { IconPlay, IconInfo, IconTV, IconFilm, IconCheck, IconChevronLeft, IconChevronRight } from './Icons';

// ── Poster Card (2:3) ─────────────────────────────────────────────────────
export function PosterCard({ item, onClick, showProgress = false }) {
  const [hov, setHov] = useState(false);
  const isTV = item.type === 'tv' || item.type === 'anime';

  return (
    <div
      onClick={() => onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="poster-card"
      style={{
        borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
        background: 'var(--surface)',
        transform: hov ? 'scale(1.07)' : 'scale(1)',
        boxShadow: hov ? '0 18px 44px rgba(0,0,0,0.75)' : '0 4px 14px rgba(0,0,0,0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative', zIndex: hov ? 10 : 1,
      }}
    >
      <div style={{ aspectRatio: '2/3', position: 'relative', background: 'var(--bg3)' }}>
        {item.poster
          ? <img src={item.poster} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 }}>
              {isTV ? <IconTV size={28} color="var(--text3)" /> : <IconFilm size={28} color="var(--text3)" />}
              <span style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.4 }}>{item.title}</span>
            </div>
        }

        {/* Hover gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top,rgba(7,9,16,0.92) 0%,rgba(7,9,16,0.35) 50%,transparent 100%)',
          opacity: hov ? 1 : 0, transition: 'opacity 0.2s',
        }} />

        {/* Rating badge */}
        {item.rating && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(0,0,0,0.78)', borderRadius: 5,
            padding: '2px 6px', fontSize: 10, color: 'var(--gold)', fontWeight: 700,
          }}>★ {item.rating}</div>
        )}

        {/* Status dot */}
        <div style={{
          position: 'absolute', top: 6, left: 6,
          width: 6, height: 6, borderRadius: '50%',
          background: item.status === 'watched' ? 'var(--green)' : item.status === 'watching' ? 'var(--gold)' : 'transparent',
          boxShadow: item.status === 'watched' ? '0 0 5px var(--green)' : item.status === 'watching' ? '0 0 5px var(--gold)' : 'none',
        }} />

        {/* Type badge */}
        {isTV && (
          <div style={{
            position: 'absolute', bottom: 7, left: 7,
            background: item.type === 'anime' ? 'rgba(155,127,232,0.88)' : 'rgba(79,163,232,0.88)',
            borderRadius: 4, padding: '2px 6px', fontSize: 9, color: '#fff', fontWeight: 700, letterSpacing: 0.4,
          }}>{item.type === 'anime' ? 'ANIME' : `S${String(item.seasonNumber || 1).padStart(2, '0')}`}</div>
        )}

        {/* Hover buttons */}
        {hov && (
          <div style={{
            position: 'absolute', bottom: 8, right: 7,
            display: 'flex', gap: 5, animation: 'fadeIn 0.12s ease',
          }}>
            <button style={{
              width: 28, height: 28, borderRadius: '50%', background: 'var(--text)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <IconPlay size={11} color="var(--bg)" />
            </button>
            <button style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <IconInfo size={12} color="#fff" />
            </button>
          </div>
        )}

        {/* Watch progress */}
        {showProgress && item.watchProgress > 0 && item.watchProgress < 100 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.12)' }}>
            <div style={{ height: '100%', width: `${item.watchProgress}%`, background: 'var(--accent)' }} />
          </div>
        )}
      </div>

      {/* Title row */}
      <div style={{ padding: '7px 9px 9px' }}>
        <div style={{
          fontWeight: 600, fontSize: 11, color: 'var(--text)', lineHeight: 1.3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{item.title}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
          {item.year || (isTV && item.episodeNumber ? `Ep ${item.episodeNumber}` : '—')}
          {item.genre ? ` · ${item.genre}` : ''}
        </div>
      </div>
    </div>
  );
}

// ── Wide Card (16:9) ──────────────────────────────────────────────────────
export function WideCard({ item, onClick }) {
  const [hov, setHov] = useState(false);
  const isTV = item.type === 'tv' || item.type === 'anime';

  return (
    <div
      onClick={() => onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="wide-card"
      style={{
        borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
        background: 'var(--surface)',
        transform: hov ? 'scale(1.05)' : 'scale(1)',
        boxShadow: hov ? '0 14px 38px rgba(0,0,0,0.7)' : '0 4px 14px rgba(0,0,0,0.4)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative', zIndex: hov ? 10 : 1,
      }}
    >
      {/* 16:9 thumb */}
      <div style={{ aspectRatio: '16/9', position: 'relative', background: 'var(--bg3)' }}>
        {(item.backdrop || item.poster)
          ? <img src={item.backdrop || item.poster} alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isTV ? <IconTV size={30} color="var(--text3)" /> : <IconFilm size={30} color="var(--text3)" />}
            </div>
        }
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top,rgba(7,9,16,0.88) 0%,transparent 55%)',
          opacity: hov ? 1 : 0.45, transition: 'opacity 0.2s',
        }} />
        {item.rating && (
          <div style={{
            position: 'absolute', top: 7, right: 7,
            background: 'rgba(0,0,0,0.78)', borderRadius: 5,
            padding: '2px 6px', fontSize: 10, color: 'var(--gold)', fontWeight: 700,
          }}>★ {item.rating}</div>
        )}
        {hov && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'fadeIn 0.12s ease',
            }}>
              <IconPlay size={15} color="var(--bg)" />
            </div>
          </div>
        )}
        {/* Progress */}
        {item.watchProgress > 0 && item.watchProgress < 100 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)' }}>
            <div style={{ height: '100%', width: `${item.watchProgress}%`, background: 'var(--accent)' }} />
          </div>
        )}
      </div>

      <div style={{ padding: '8px 10px 10px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{item.title}</div>
        {item.episodeTitle && (
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{item.episodeTitle}</div>
        )}
        {isTV && item.episodeNumber && (
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
            S{String(item.seasonNumber || 1).padStart(2, '0')} · E{String(item.episodeNumber).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Series Folder Card ─────────────────────────────────────────────────────
export function SeriesCard({ series, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={() => onClick(series)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="poster-card"
      style={{
        borderRadius: 8, overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
        background: 'var(--surface)',
        transform: hov ? 'scale(1.07)' : 'scale(1)',
        boxShadow: hov ? '0 18px 44px rgba(0,0,0,0.75)' : '0 4px 14px rgba(0,0,0,0.45)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        position: 'relative', zIndex: hov ? 10 : 1,
      }}
    >
      <div style={{ aspectRatio: '2/3', position: 'relative', background: 'var(--bg3)' }}>
        {series.poster
          ? <img src={series.poster} alt={series.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <IconTV size={28} color="var(--text3)" />
              <span style={{ fontSize: 9, color: 'var(--text3)', textAlign: 'center', padding: '0 7px', lineHeight: 1.4 }}>{series.title}</span>
            </div>
        }
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top,rgba(7,9,16,0.9) 0%,transparent 55%)',
          opacity: hov ? 1 : 0.35, transition: 'opacity 0.2s',
        }} />
        {/* Episode count */}
        <div style={{
          position: 'absolute', top: 6, right: 6,
          background: 'rgba(0,0,0,0.8)', borderRadius: 5,
          padding: '2px 7px', fontSize: 10, color: 'var(--text)', fontWeight: 600,
        }}>{series.episodeCount} ep</div>
        {/* Hover CTA */}
        {hov && (
          <div style={{
            position: 'absolute', bottom: 7, left: 6, right: 6,
            animation: 'fadeIn 0.12s ease',
          }}>
            <div style={{
              width: '100%', padding: '6px 0', borderRadius: 6,
              background: 'rgba(255,255,255,0.9)', textAlign: 'center',
              fontSize: 10, fontWeight: 700, color: 'var(--bg)',
              fontFamily: 'var(--font-body)',
            }}>View Episodes</div>
          </div>
        )}
      </div>
      <div style={{ padding: '7px 9px 9px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{series.title}</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
          Season {series.season} · {series.episodeCount} eps
        </div>
      </div>
    </div>
  );
}

// ── Carousel ───────────────────────────────────────────────────────────────
export function Carousel({ title, icon: Icon, children, onClear }) {
  const scrollRef = useRef();
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  if (!items.length) return null;

  const scroll = dir => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.75), behavior: 'smooth' });
  };

  return (
    <section style={{ marginBottom: 36 }}>
      {/* Header */}
      <div className="page-pad" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <h2 style={{
          fontSize: 'clamp(14px,3vw,18px)', fontWeight: 700,
          color: 'var(--text)', fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {Icon && <Icon size={16} color="var(--text2)" />}
          {title}
        </h2>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Clear button for Recently Added */}
          {onClear && (
            <button
              onClick={onClear}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "var(--text2)",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "var(--text2)";
              }}
            >
              Clear (keep 5)
            </button>
          )}
          {/* Arrow buttons — desktop only */}
          <div className="hide-mobile" style={{ display: 'flex', gap: 5 }}>
            <button onClick={() => scroll(-1)} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >
              <IconChevronLeft size={14} color="var(--text2)" />
            </button>
            <button onClick={() => scroll(1)} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            >
              <IconChevronRight size={14} color="var(--text2)" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable row */}
      <div ref={scrollRef} className="hide-scrollbar page-pad" style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6,
      }}>
        {items}
      </div>
    </section>
  );
}
