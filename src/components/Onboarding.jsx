import { useState, useRef, useCallback } from "react";
import {
  IconLogoMark,
  IconUpload,
  IconFilm,
  IconTV,
  IconFolder,
  IconScan,
  IconClock,
  IconSearch,
} from "./Icons";

const FEATURES = [
  {
    Icon: IconSearch,
    title: "Scene Release Parser",
    desc: "Strips 60+ noise patterns — codecs, watermarks, CRCs, fansub tags, streaming labels",
  },
  {
    Icon: IconTV,
    title: "TV & Anime Detection",
    desc: "S01E05, 1×05, dash-episode, high ep numbers (1000+), OVAs & Specials, multi-episode",
  },
  {
    Icon: IconFilm,
    title: "Movie Identification",
    desc: "Year extraction, multi-part films, director's cuts, IMAX editions",
  },
  {
    Icon: IconFolder,
    title: "Smart Folder Paths",
    desc: "/Movies/Genre/Title (Year)/ and /TV Shows/Show/Season XX/",
  },
  {
    Icon: IconClock,
    title: "8-Minute Minimum",
    desc: "Short clips, trailers and samples under 8 min are automatically rejected",
  },
  {
    Icon: IconScan,
    title: "TMDB Enrichment",
    desc: "Posters, overviews, ratings and genres fetched automatically (free API key)",
  },
];

export default function Onboarding({ onFiles }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handle = useCallback(
    (files) => {
      const vids = Array.from(files).filter((f) =>
        /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|m2ts)$/i.test(f.name),
      );
      if (vids.length) onFiles(vids);
    },
    [onFiles],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 14px 40px",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <IconLogoMark size={44} color="var(--accent)" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(34px,8vw,52px)",
              letterSpacing: 5,
              color: "var(--text)",
            }}
          >
            FILM<span style={{ color: "var(--accent)" }}>SORT</span>
          </span>
        </div>
        <div
          style={{
            color: "var(--text2)",
            fontSize: "clamp(13px,3vw,16px)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Drop your messy video files. FilmSort identifies, enriches, and
          organises everything automatically.
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files);
        }}
        style={{
          width: "100%",
          maxWidth: 580,
          border: `2px dashed ${drag ? "var(--accent)" : "rgba(255,255,255,0.11)"}`,
          borderRadius: 18,
          padding: "clamp(28px,6vw,52px) clamp(16px,5vw,40px)",
          textAlign: "center",
          cursor: "pointer",
          background: drag ? "rgba(232,55,44,0.06)" : "rgba(255,255,255,0.012)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="video/*,.mkv,.avi"
          style={{ display: "none" }}
          onChange={(e) => handle(e.target.files)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: drag
                ? "rgba(232,55,44,0.15)"
                : "rgba(255,255,255,0.04)",
              border: `1.5px solid ${drag ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <IconUpload
              size={26}
              color={drag ? "var(--accent)" : "var(--text2)"}
            />
          </div>
        </div>

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(18px,4vw,22px)",
            letterSpacing: 2,
            color: "var(--text)",
            marginBottom: 7,
          }}
        >
          DROP VIDEO FILES TO BEGIN
        </div>
        <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 18 }}>
          MP4 · MKV · AVI · MOV · WMV · WebM · M4V
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "9px 26px",
            borderRadius: 8,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          or click to browse
        </div>
      </div>

      {/* Feature grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginTop: 36,
          width: "100%",
          maxWidth: 640,
        }}
      >
        {FEATURES.map(({ Icon, title, desc }) => (
          <div
            key={title}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px 15px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              <Icon size={18} color="var(--text2)" />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--text)",
                  marginBottom: 4,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  color: "var(--text3)",
                  fontSize: 11,
                  lineHeight: 1.55,
                }}
              >
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          color: "var(--text3)",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        Add a free TMDB API key in{" "}
        <code
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--surface)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          src/utils/tmdb.js
        </code>{" "}
        for posters and metadata
      </div>
    </div>
  );
}
