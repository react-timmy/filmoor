import { useState } from "react";
import { IconPlay, IconInfo } from "./Icons";

export default function Hero({ item, onInfo, onPlay }) {
  const [loaded, setLoaded] = useState(false);
  if (!item) return null;

  const isTV = item.type === "tv" || item.type === "anime";
  const genres = item.genres?.length
    ? item.genres
    : item.genre
      ? [item.genre]
      : [];

  const handlePlay = () => {
    if (onPlay && item.id) {
      onPlay(item.id);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "500px",
        height: "clamp(500px, 60vw, 750px)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Backdrop - positioned on right */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {item.backdrop ? (
          <img
            src={item.backdrop}
            alt=""
            onLoad={() => setLoaded(true)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "right center",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.8s ease",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)",
            }}
          />
        )}
      </div>

      {/* Left-side gradient overlay - creates dark safe zone for content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(7,9,16,0.95) 0%, rgba(7,9,16,0.85) 35%, rgba(7,9,16,0.4) 60%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top fade for navbar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          background:
            "linear-gradient(to bottom, rgba(7,9,16,0.6) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background:
            "linear-gradient(to top, rgba(7,9,16,0.8) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content Container - left side */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "550px",
          width: "100%",
          paddingLeft: "clamp(16px, 5%, 60px)",
          paddingRight: "clamp(16px, 3%, 40px)",
          animation: "fadeUp 0.7s ease both",
        }}
      >
        {/* Genres badge */}
        {genres.length > 0 && (
          <div
            style={{
              display: "inline-flex",
              gap: 8,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            {genres.slice(0, 2).map((genre, i) => (
              <span
                key={i}
                style={{
                  color: "var(--gold)",
                  fontSize: "clamp(11px, 1.2vw, 13px)",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Main Title */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 7vw, 72px)",
            letterSpacing: "clamp(0.5px, 0.3vw, 2px)",
            lineHeight: 0.9,
            color: "var(--text)",
            marginBottom: 20,
            fontWeight: 900,
            textShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {item.title}
        </h1>

        {/* Meta info row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
            flexWrap: "wrap",
            fontSize: "clamp(12px, 1.5vw, 14px)",
          }}
        >
          {item.year && (
            <span style={{ color: "var(--text2)" }}>{item.year}</span>
          )}
          {item.rating && (
            <span style={{ color: "var(--gold)", fontWeight: 700 }}>
              ★ {item.rating}
            </span>
          )}
          {item.runtime && (
            <span style={{ color: "var(--text2)" }}>
              {Math.floor(item.runtime / 60)}h {item.runtime % 60}m
            </span>
          )}
          {isTV && item.seasonNumber && (
            <span style={{ color: "var(--text2)" }}>
              {item.seasonNumber}{" "}
              {item.seasonNumber === 1 ? "Season" : "Seasons"}
            </span>
          )}
        </div>

        {/* Overview description */}
        {item.overview && (
          <p
            style={{
              color: "var(--text2)",
              fontSize: "clamp(13px, 1.5vw, 15px)",
              lineHeight: 1.6,
              maxWidth: 500,
              marginBottom: 32,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.overview}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button
            style={{
              background: "var(--text)",
              color: "var(--bg)",
              border: "none",
              padding: "clamp(10px, 1.2vw, 14px) clamp(20px, 3vw, 32px)",
              borderRadius: 6,
              fontSize: "clamp(13px, 1.3vw, 15px)",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-body)",
              transition: "all 0.25s ease",
              letterSpacing: 0.3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <IconPlay size={15} color="var(--bg)" /> Play
          </button>
          <button
            onClick={() => onInfo(item)}
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              color: "var(--text)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              padding: "clamp(10px, 1.2vw, 14px) clamp(20px, 3vw, 32px)",
              borderRadius: 6,
              fontSize: "clamp(13px, 1.3vw, 15px)",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-body)",
              transition: "all 0.25s ease",
              letterSpacing: 0.3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.22)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <IconInfo size={15} color="var(--text)" /> More Info
          </button>
        </div>
      </div>
    </div>
  );
}
