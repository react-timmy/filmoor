import { useState } from 'react';
import { IconPlay, IconInfo } from './Icons';

export default function Hero({ item, onInfo }) {
  const [loaded, setLoaded] = useState(false);
  if (!item) return null;

  const isTV = item.type === 'tv' || item.type === 'anime';
  const genres = item.genres?.length ? item.genres : item.genre ? [item.genre] : [];

  return (
    <div style={{
      position: 'relative', width: '100%',
      height: 'clamp(420px, 72vw, 88vh)',
      overflow: 'hidden',
    }}>
      {/* Backdrop */}
      {item.backdrop
        ? <img src={item.backdrop} alt="" onLoad={() => setLoaded(true)} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 20%',
            opacity: loaded ? 1 : 0, transition: 'opacity 0.8s ease',
          }} />
        : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }} />
      }

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 55% at 25% 45%, ${item.dominantColor || '#1a2030'}55 0%, transparent 65%)`,
        mixBlendMode: 'screen',
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right,rgba(7,9,16,0.93) 0%,rgba(7,9,16,0.55) 45%,rgba(7,9,16,0.05) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top,#070910 0%,rgba(7,9,16,0.3) 35%,transparent 65%)',
      }} />
      {/* Top fade for navbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 80,
        background: 'linear-gradient(to bottom,rgba(7,9,16,0.5) 0%,transparent 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 'clamp(24px,5vw,72px)',
        left: 'clamp(14px,4vw,60px)',
        right: 'clamp(14px,40%,48%)',
        animation: 'fadeUp 0.6s ease both',
      }}>
        {/* Floating poster */}
        <div style={{
          width: 'clamp(80px,14vw,130px)',
          height: 'clamp(120px,21vw,195px)',
          borderRadius: 10, boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
          overflow: 'hidden', marginBottom: 'clamp(12px,2vw,20px)',
          background: 'var(--surface)', flexShrink: 0,
        }}>
          {item.poster
            ? <img src={item.poster} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isTV ? <IconTV size={32} color="var(--text3)" /> : <IconPlay size={32} color="var(--text3)" />}
              </div>
          }
        </div>

        {/* Genres dot-separated */}
        {genres.length > 0 && (
          <div style={{ color: 'var(--text2)', fontSize: 'clamp(10px,2vw,12px)', fontWeight: 500, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' }}>
            {genres.slice(0, 3).join(' · ')}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px,6vw,64px)',
          letterSpacing: 'clamp(1px,0.4vw,3px)',
          lineHeight: 0.95, color: 'var(--text)',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          marginBottom: 'clamp(8px,1.5vw,14px)',
        }}>{item.title}</div>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          {item.year && <span style={{ color: 'var(--text2)', fontSize: 13 }}>{item.year}</span>}
          {item.rating && <span style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600 }}>★ {item.rating}</span>}
          {item.runtime && <span style={{ color: 'var(--text2)', fontSize: 13 }}>{Math.floor(item.runtime / 60)}h {item.runtime % 60}m</span>}
          {isTV && item.episodeNumber && (
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>
              S{String(item.seasonNumber || 1).padStart(2, '0')} · E{String(item.episodeNumber).padStart(2, '0')}
            </span>
          )}
        </div>

        {/* Overview */}
        {item.overview && (
          <div style={{
            color: 'var(--text2)', fontSize: 'clamp(12px,1.8vw,14px)', lineHeight: 1.65,
            maxWidth: 480, marginBottom: 'clamp(14px,2.5vw,24px)',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{item.overview}</div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{
            background: 'var(--text)', color: 'var(--bg)', border: 'none',
            padding: '10px 22px', borderRadius: 8,
            fontSize: 'clamp(12px,1.8vw,14px)', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-body)', transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <IconPlay size={13} color="var(--bg)" /> Play
          </button>
          <button onClick={() => onInfo(item)} style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            color: 'var(--text)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 20px', borderRadius: 8,
            fontSize: 'clamp(12px,1.8vw,14px)', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-body)', transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <IconInfo size={14} color="var(--text)" /> More Info
          </button>
        </div>
      </div>
    </div>
  );
}
