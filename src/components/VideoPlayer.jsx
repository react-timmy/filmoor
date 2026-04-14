import { useState, useRef, useEffect } from "react";
import {
  IconPlay,
  IconPause,
  IconRewind,
  IconForward,
  IconListVideo,
  IconSubtitles,
  IconChevronLeft,
} from "./Icons";

export default function VideoPlayer({
  src,
  title,
  onBack,
  onUpdateProgress,
  initialProgress = 0,
  episodes = [],
  currentEpisodeIndex = -1,
  onSelectEpisode = null,
  onNextEpisode = null,
  onPrevEpisode = null,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodesPanel, setShowEpisodesPanel] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Format time display (MM:SS)
  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds),
      );
    }
  };

  const handleProgressChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Update progress in parent
      if (onUpdateProgress) {
        const progress = (videoRef.current.currentTime / duration) * 100 || 0;
        onUpdateProgress(progress, videoRef.current.currentTime);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Restore from initial progress
      if (initialProgress > 0) {
        videoRef.current.currentTime =
          (initialProgress / 100) * videoRef.current.duration;
        setCurrentTime(videoRef.current.currentTime);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const hideControlsTimer = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        3000,
      );
    }
  };

  // Handle keyboard shortcuts for episodes
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "n" || e.key === "N") {
        if (onNextEpisode) onNextEpisode();
      }
      if (e.key === "p" || e.key === "P") {
        if (onPrevEpisode) onPrevEpisode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNextEpisode, onPrevEpisode]);

  const handleMouseMove = () => {
    hideControlsTimer();
  };

  useEffect(() => {
    if (isPlaying) {
      hideControlsTimer();
    } else {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
    }

    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const progressPercent = (currentTime / duration) * 100 || 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding:
            "clamp(60px, 12vw, 90px) clamp(12px, 3vw, 20px) clamp(12px, 3vw, 20px)",
          background:
            showControls || !isPlaying
              ? "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)"
              : "transparent",
          transition: "all 0.3s",
          zIndex: 10,
          paddingTop: "clamp(70px, 15vw, 100px)",
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width: "clamp(36px, 8vw, 48px)",
            height: "clamp(36px, 8vw, 48px)",
            borderRadius: 8,
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
          }
        >
          <IconChevronLeft size={clamp(18, 24, 28)} color="#fff" />
        </button>

        {/* Title */}
        <div
          style={{
            flex: 1,
            textAlign: "center",
            color: "#fff",
            fontSize: "clamp(14px, 3vw, 18px)",
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            margin: "0 clamp(8px, 2vw, 16px)",
          }}
        >
          {title}
        </div>

        {/* Placeholder for cast/share button */}
        <div
          style={{
            width: "clamp(36px, 8vw, 48px)",
            height: "clamp(36px, 8vw, 48px)",
          }}
        />
      </div>

      {/* Center controls */}
      {(showControls || !isPlaying) && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            gap: "clamp(20px, 8vw, 60px)",
            zIndex: 10,
          }}
        >
          {/* Rewind 10s */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "clamp(4px, 1vw, 8px)",
            }}
          >
            <button
              onClick={() => handleSkip(-10)}
              style={{
                width: "clamp(50px, 12vw, 80px)",
                height: "clamp(50px, 12vw, 80px)",
                borderRadius: "50%",
                border: "2px solid #fff",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
            >
              <IconRewind size={clamp(16, 24, 32)} color="#fff" />
            </button>
            <span
              style={{
                fontSize: "clamp(11px, 1.5vw, 13px)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              10s
            </span>
          </div>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            style={{
              width: "clamp(70px, 16vw, 100px)",
              height: "clamp(70px, 16vw, 100px)",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.25)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
            }
          >
            {isPlaying ? (
              <IconPause size={clamp(28, 35, 48)} color="#fff" />
            ) : (
              <IconPlay size={clamp(28, 35, 48)} color="#fff" />
            )}
          </button>

          {/* Forward 10s */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "clamp(4px, 1vw, 8px)",
            }}
          >
            <button
              onClick={() => handleSkip(10)}
              style={{
                width: "clamp(50px, 12vw, 80px)",
                height: "clamp(50px, 12vw, 80px)",
                borderRadius: "50%",
                border: "2px solid #fff",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
            >
              <IconForward size={clamp(16, 24, 32)} color="#fff" />
            </button>
            <span
              style={{
                fontSize: "clamp(11px, 1.5vw, 13px)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              10s
            </span>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          background: showControls
            ? "linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
            : "transparent",
          transition: "all 0.3s",
          zIndex: 10,
        }}
      >
        {/* Progress bar */}
        <div
          onClick={handleProgressChange}
          style={{
            width: "100%",
            height: 3,
            background: "rgba(255,255,255,0.2)",
            cursor: "pointer",
            position: "relative",
            margin: "0 0 clamp(12px, 3vw, 20px) 0",
          }}
        >
          {/* Filled progress */}
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "#e74c3c",
              transition: "width 0.1s linear",
            }}
          />

          {/* Scrubber dot */}
          {showControls && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: `${progressPercent}%`,
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#e74c3c",
                boxShadow: "0 0 8px rgba(231, 76, 60, 0.8)",
              }}
            />
          )}
        </div>

        {/* Time display and controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 clamp(12px, 3vw, 20px) clamp(12px, 3vw, 20px)",
            gap: 12,
          }}
        >
          <div
            style={{
              color: "#fff",
              fontSize: "clamp(12px, 2vw, 14px)",
              fontFamily: "var(--font-body)",
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "clamp(16px, 4vw, 32px)",
            }}
          >
            <button
              onClick={() => setShowEpisodesPanel(!showEpisodesPanel)}
              style={{
                background: "none",
                border: "none",
                color: showEpisodesPanel
                  ? "var(--accent)"
                  : "rgba(255,255,255,0.8)",
                cursor: "pointer",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = showEpisodesPanel
                  ? "var(--accent)"
                  : "rgba(255,255,255,0.8)")
              }
              title={episodes.length > 0 ? "Show episodes" : "No episodes"}
              disabled={episodes.length === 0}
            >
              <IconListVideo size={18} color="currentColor" />
              <span
                style={{
                  fontSize: "clamp(11px, 2vw, 13px)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Episodes
              </span>
            </button>

            <button
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
              }
            >
              <IconSubtitles size={18} color="currentColor" />
              <span
                style={{
                  fontSize: "clamp(11px, 2vw, 13px)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Audio & Subtitles
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Episodes panel */}
      {showEpisodesPanel && episodes.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: "50vh",
            overflowY: "auto",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.9))",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            zIndex: 20,
            animation: "slideUp 0.3s ease-out",
          }}
        >
          <div style={{ padding: "16px 20px" }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text)",
                fontFamily: "var(--font-display)",
                margin: "0 0 12px 0",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Episodes
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "12px",
              }}
            >
              {episodes.map((episode, index) => (
                <div
                  key={episode.id}
                  onClick={() => {
                    if (onSelectEpisode) {
                      onSelectEpisode(episode.id);
                    }
                    setShowEpisodesPanel(false);
                  }}
                  style={{
                    position: "relative",
                    borderRadius: 8,
                    overflow: "hidden",
                    background:
                      index === currentEpisodeIndex
                        ? "var(--accent)"
                        : "rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    border:
                      index === currentEpisodeIndex
                        ? "2px solid var(--accent)"
                        : "1px solid rgba(255,255,255,0.1)",
                    padding: "8px",
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    if (index !== currentEpisodeIndex) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.12)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (index !== currentEpisodeIndex) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                    }
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color:
                          index === currentEpisodeIndex
                            ? "#fff"
                            : "var(--text3)",
                        fontFamily: "var(--font-body)",
                        margin: "0 0 4px 0",
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      EP {index + 1}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color:
                          index === currentEpisodeIndex
                            ? "#fff"
                            : "var(--text)",
                        fontFamily: "var(--font-body)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.3,
                      }}
                    >
                      {episode.filename}
                    </p>
                  </div>

                  {index === currentEpisodeIndex && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                        fontFamily: "var(--font-body)",
                        marginTop: 6,
                      }}
                    >
                      ▶ Playing
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            {(currentEpisodeIndex > 0 ||
              currentEpisodeIndex < episodes.length - 1) && (
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginTop: 16,
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={onPrevEpisode}
                  disabled={currentEpisodeIndex === 0}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background:
                      currentEpisodeIndex === 0
                        ? "rgba(255,255,255,0.1)"
                        : "var(--accent)",
                    border: "none",
                    color: "#fff",
                    cursor: currentEpisodeIndex === 0 ? "default" : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s",
                    opacity: currentEpisodeIndex === 0 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentEpisodeIndex > 0) {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title="Previous episode (P)"
                >
                  ← Previous
                </button>

                <button
                  onClick={onNextEpisode}
                  disabled={currentEpisodeIndex >= episodes.length - 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background:
                      currentEpisodeIndex >= episodes.length - 1
                        ? "rgba(255,255,255,0.1)"
                        : "var(--accent)",
                    border: "none",
                    color: "#fff",
                    cursor:
                      currentEpisodeIndex >= episodes.length - 1
                        ? "default"
                        : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s",
                    opacity:
                      currentEpisodeIndex >= episodes.length - 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentEpisodeIndex < episodes.length - 1) {
                      e.currentTarget.style.transform = "scale(1.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title="Next episode (N)"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 50vh;
            opacity: 1;
          }
        }

        video::-webkit-media-controls {
          display: none;
        }
      `}</style>
    </div>
  );
}

function clamp(min, val, max) {
  return Math.min(Math.max(val, min), max);
}
