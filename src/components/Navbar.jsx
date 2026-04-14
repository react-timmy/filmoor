import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  IconSearch,
  IconScan,
  IconLogoMark,
  IconFilm,
  IconTV,
  IconClose,
  IconHome,
  IconLibrary,
} from "./Icons";
import avatar1 from "../assets/avatar1.jpg";
import avatar2 from "../assets/avatar2.jpg";
import avatar3 from "../assets/avatar3.jpg";
import avatar4 from "../assets/avatar4.jpg";
import avatar5 from "../assets/avatar5.jpg";

const AVATAR_IMAGES = {
  "avatar-1": avatar1,
  "avatar-2": avatar2,
  "avatar-3": avatar3,
  "avatar-4": avatar4,
  "avatar-5": avatar5,
};

export default function Navbar({
  onScan,
  isProcessing,
  processingCount,
  library,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, selectedProfile, user } = useAuth();

  const getAvatarImage = (avatarId) => {
    return AVATAR_IMAGES[avatarId] || AVATAR_IMAGES["avatar-1"];
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      library
        .filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.episodeTitle?.toLowerCase().includes(q),
        )
        .slice(0, 8),
    );
  }, [searchQuery, library]);

  const handleScan = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.multiple = true;
    inp.accept = "video/*,.mkv,.avi,.mp4,.mov,.wmv,.webm";
    inp.onchange = (e) => onScan(Array.from(e.target.files));
    inp.click();
  };

  const isHome = location.pathname === "/";
  const isLib = location.pathname === "/library";

  return (
    <>
      {/* ── Top bar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "var(--nav-top)",
          background: scrolled
            ? "rgba(7,9,16,0.97)"
            : "linear-gradient(to bottom,rgba(7,9,16,0.88) 0%,transparent 100%)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "background 0.3s, backdrop-filter 0.3s",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 0,
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            flexShrink: 0,
            marginRight: 16,
          }}
        >
          <IconLogoMark size={26} color="var(--accent)" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 19,
              letterSpacing: 2,
              color: "var(--text)",
            }}
            className="hide-mobile"
          >
            FILM<span style={{ color: "var(--accent)" }}>SORT</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hide-mobile" style={{ display: "flex", gap: 2 }}>
          {[
            ["/", "Home"],
            ["/library", "Library"],
          ].map(([path, label]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                background: "none",
                border: "none",
                padding: "6px 12px",
                borderRadius: 8,
                color:
                  location.pathname === path ? "var(--text)" : "var(--text2)",
                fontSize: 14,
                fontWeight: location.pathname === path ? 600 : 400,
                cursor: "pointer",
                transition: "color 0.2s",
                fontFamily: "var(--font-body)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Processing pill */}
        {isProcessing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(245,200,66,0.1)",
              border: "1px solid rgba(245,200,66,0.22)",
              borderRadius: 99,
              padding: "4px 10px",
              fontSize: 11,
              color: "var(--gold)",
              marginRight: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                flexShrink: 0,
                border: "2px solid var(--gold)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span className="hide-mobile">
              Identifying {processingCount} file
              {processingCount !== 1 ? "s" : ""}…
            </span>
          </div>
        )}

        {/* Search */}
        <button
          onClick={() => setSearchOpen((s) => !s)}
          style={{
            background: searchOpen ? "rgba(255,255,255,0.09)" : "none",
            border: "1px solid",
            borderColor: searchOpen ? "rgba(255,255,255,0.14)" : "transparent",
            width: 38,
            height: 38,
            borderRadius: 10,
            marginRight: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text2)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {searchOpen ? (
            <IconClose size={17} color="var(--text2)" />
          ) : (
            <IconSearch size={17} color="var(--text2)" />
          )}
        </button>

        {/* Scan */}
        {selectedProfile && (
          <>
            {/* Profile Menu */}
            <div
              ref={profileRef}
              style={{
                position: "relative",
                marginRight: 10,
              }}
            >
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  background: "none",
                  border: "2px solid rgba(255,255,255,0.14)",
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  overflow: "hidden",
                  padding: 0,
                }}
              >
                <img
                  src={getAvatarImage(selectedProfile?.avatar)}
                  alt={selectedProfile.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: 44,
                    right: 0,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    minWidth: 180,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                    zIndex: 1001,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 16px",
                        color: "var(--text2)",
                        fontSize: 12,
                      }}
                    >
                      <p style={{ fontWeight: 600, color: "var(--text)" }}>
                        {user?.name}
                      </p>
                      <p style={{ fontSize: 11, marginTop: 2 }}>
                        {selectedProfile.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/profiles");
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      color: "var(--text2)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    Switch Profile
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/auth");
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      color: "var(--text2)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background 0.2s",
                      textAlign: "left",
                      fontFamily: "var(--font-body)",
                      borderTop: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={handleScan}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0 14px",
            height: 36,
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
            fontFamily: "var(--font-body)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <IconScan size={14} color="#fff" />
          <span className="hide-mobile">Scan Files</span>
        </button>
      </nav>

      {/* ── Bottom nav (mobile only) ── */}
      <nav
        className="show-mobile"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "var(--nav-bottom)",
          background: "rgba(7,9,16,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {[
          {
            label: "Home",
            Icon: IconHome,
            action: () => navigate("/"),
            active: isHome,
          },
          {
            label: "Library",
            Icon: IconLibrary,
            action: () => navigate("/library"),
            active: isLib,
          },
          { label: "Scan", Icon: IconScan, action: handleScan, accent: true },
        ].map(({ label, Icon, action, active, accent }) => (
          <button
            key={label}
            onClick={action}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              color: accent
                ? "var(--accent)"
                : active
                  ? "var(--text)"
                  : "var(--text3)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              borderTop: active
                ? "2px solid var(--accent)"
                : "2px solid transparent",
              transition: "color 0.15s",
            }}
          >
            <Icon
              size={20}
              color={
                accent
                  ? "var(--accent)"
                  : active
                    ? "var(--text)"
                    : "var(--text3)"
              }
            />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            top: "var(--nav-top)",
            left: 0,
            right: 0,
            zIndex: 999,
            background: "rgba(7,9,16,0.98)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            padding: "14px 14px 18px",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div style={{ position: "relative", maxWidth: 600 }}>
            <div
              style={{
                position: "absolute",
                left: 13,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
            >
              <IconSearch size={15} color="var(--text3)" />
            </div>
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
              placeholder="Search your library…"
              style={{
                width: "100%",
                background: "var(--surface)",
                border: "1px solid var(--border2)",
                borderRadius: 12,
                padding: "11px 14px 11px 40px",
                fontSize: 15,
                color: "var(--text)",
                outline: "none",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>
          {searchResults.length > 0 && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                maxWidth: 600,
              }}
            >
              {searchResults.map((item) => (
                <SearchResult
                  key={item.id}
                  item={item}
                  onClick={() => {
                    navigate("/library");
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                />
              ))}
            </div>
          )}
          {searchQuery && !searchResults.length && (
            <div style={{ marginTop: 14, color: "var(--text3)", fontSize: 14 }}>
              No results for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      <style>{`
        .hide-mobile { display: flex !important; }
        .show-mobile { display: flex !important; }
        @media (min-width: 640px) {
          .show-mobile { display: none !important; }
        }
        @media (max-width: 639px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

function SearchResult({ item, onClick }) {
  const isTV = item.type === "tv" || item.type === "anime";
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 12px",
        borderRadius: 10,
        background: "var(--surface)",
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--surface2)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "var(--surface)")
      }
    >
      {item.poster ? (
        <img
          src={item.poster}
          alt=""
          style={{
            width: 30,
            height: 45,
            objectFit: "cover",
            borderRadius: 5,
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 30,
            height: 45,
            background: "var(--surface2)",
            borderRadius: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isTV ? (
            <IconTV size={14} color="var(--text3)" />
          ) : (
            <IconFilm size={14} color="var(--text3)" />
          )}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
          {item.year && `${item.year} · `}
          {isTV && item.episodeNumber
            ? `S${String(item.seasonNumber || 1).padStart(2, "0")}E${String(item.episodeNumber).padStart(2, "0")}`
            : item.type}
        </div>
      </div>
    </div>
  );
}
