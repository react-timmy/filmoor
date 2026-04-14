import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalLibrary } from "../hooks/useLocalLibrary";
import { IconPlay, IconTrash, IconFilm, IconTV } from "../components/Icons";

export default function LocalLibrary() {
  const navigate = useNavigate();
  const { localLibrary, removeLocalFile } = useLocalLibrary();
  const [expandedFolders, setExpandedFolders] = useState({});
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  const handlePlay = (fileId) => {
    navigate(`/local-player/${fileId}`);
  };

  const handleDelete = async (fileId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this file from your library?")) {
      await removeLocalFile(fileId);
    }
  };

  // Organize files by folder structure
  const organizeFiles = () => {
    const folders = {};
    const standaloneFiles = [];

    localLibrary.forEach((file) => {
      const relativePath = file.relativePath || file.filename;
      const pathParts = relativePath.split("/");

      if (pathParts.length > 1) {
        // File is in a folder
        const folderPath = pathParts.slice(0, -1).join("/");
        if (!folders[folderPath]) {
          folders[folderPath] = [];
        }
        folders[folderPath].push(file);
      } else {
        // Standalone file
        standaloneFiles.push(file);
      }
    });

    return { folders, standaloneFiles };
  };

  const { folders, standaloneFiles } = organizeFiles();

  const toggleFolder = (folderPath) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  if (localLibrary.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "var(--text2)",
            fontFamily: "var(--font-body)",
          }}
        >
          <p style={{ fontSize: 18, marginBottom: 8 }}>No local files yet</p>
          <p style={{ fontSize: 14, color: "var(--text3)" }}>
            Upload videos using the "Scan" or "Local Files" button in the navbar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "var(--nav-top) 0 clamp(24px,4vw,60px) 0",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <div
          style={{
            padding: "20px var(--page-pad)",
            borderBottom: "1px solid var(--border)",
            marginBottom: 20,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(24px, 5vw, 32px)",
              fontWeight: 700,
              color: "var(--text)",
              fontFamily: "var(--font-display)",
              margin: 0,
            }}
          >
            My Local Files
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text3)",
              marginTop: 4,
              fontFamily: "var(--font-body)",
            }}
          >
            {localLibrary.length} file{localLibrary.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ padding: "0 var(--page-pad)", marginBottom: 20 }}>
          {/* Series/Folder Sections */}
          {Object.keys(folders).length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 700,
                  color: "var(--text)",
                  fontFamily: "var(--font-display)",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <IconTV size={20} color="var(--text)" />
                Series & Folders
              </h2>

              {Object.entries(folders).map(([folderPath, files]) => {
                const folderName = folderPath.split("/").pop();
                const isExpanded = expandedFolders[folderPath];
                const currentlySelected =
                  selectedEpisode?.folderPath === folderPath
                    ? selectedEpisode
                    : files[0];

                return (
                  <div key={folderPath} style={{ marginBottom: 40 }}>
                    {/* Series header */}
                    <div
                      onClick={() => toggleFolder(folderPath)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "16px 20px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 12,
                        cursor: "pointer",
                        marginBottom: 20,
                        transition: "all 0.2s",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.1)";
                      }}
                    >
                      <div
                        style={{
                          transform: isExpanded
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                          fontSize: 16,
                        }}
                      >
                        ▶
                      </div>
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "var(--text)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {folderName}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text3)",
                            fontFamily: "var(--font-body)",
                            marginLeft: 12,
                          }}
                        >
                          {files.length} episode{files.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Expanded view with selected episode and episodes list */}
                    {isExpanded && (
                      <div style={{ marginBottom: 20 }}>
                        {/* Selected Episode Info */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "280px 1fr",
                            gap: "24px",
                            marginBottom: 24,
                            alignItems: "flex-start",
                          }}
                        >
                          {/* Episode Thumbnail */}
                          <div
                            style={{
                              position: "relative",
                              borderRadius: 12,
                              overflow: "hidden",
                              background: "var(--surface)",
                              border: "1px solid var(--border)",
                              aspectRatio: "16/9",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--accent)";
                              e.currentTarget.style.transform = "scale(1.02)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--border)";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                            onClick={() => handlePlay(currentlySelected.id)}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                background:
                                  "linear-gradient(135deg, rgba(245,200,66,0.1), rgba(52,152,219,0.1))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <IconPlay
                                size={48}
                                color="rgba(255,255,255,0.6)"
                              />
                            </div>

                            {/* Progress bar */}
                            {currentlySelected.watchProgress > 0 &&
                              currentlySelected.watchProgress < 100 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    height: 3,
                                    width: `${currentlySelected.watchProgress}%`,
                                    background: "var(--accent)",
                                  }}
                                />
                              )}

                            {/* Watched indicator */}
                            {currentlySelected.watchProgress === 100 && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  background: "var(--accent)",
                                  color: "#fff",
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  fontFamily: "var(--font-body)",
                                }}
                              >
                                ✓ Watched
                              </div>
                            )}
                          </div>

                          {/* Episode Info */}
                          <div style={{ paddingTop: 12 }}>
                            <h3
                              style={{
                                fontSize: "clamp(20px, 4vw, 28px)",
                                fontWeight: 700,
                                color: "var(--text)",
                                fontFamily: "var(--font-display)",
                                margin: "0 0 8px 0",
                                textTransform: "uppercase",
                                letterSpacing: 1,
                              }}
                            >
                              {folderName}
                            </h3>
                            <p
                              style={{
                                fontSize: 14,
                                color: "var(--text3)",
                                fontFamily: "var(--font-body)",
                                margin: "0 0 16px 0",
                              }}
                            >
                              {files.length} episode
                              {files.length !== 1 ? "s" : ""}
                            </p>
                            <p
                              style={{
                                fontSize: 13,
                                color: "var(--text2)",
                                fontFamily: "var(--font-body)",
                                margin: 0,
                                lineHeight: 1.5,
                              }}
                            >
                              {currentlySelected.filename}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--text3)",
                                fontFamily: "var(--font-body)",
                                margin: "8px 0 0 0",
                              }}
                            >
                              Duration:{" "}
                              {formatDuration(
                                currentlySelected.durationSeconds,
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Episodes Grid */}
                        <div style={{ marginTop: 30 }}>
                          <h4
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "var(--text2)",
                              fontFamily: "var(--font-body)",
                              marginBottom: 12,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            Episodes
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(200px, 1fr))",
                              gap: "clamp(12px, 2vw, 16px)",
                            }}
                          >
                            {files.map((episode) => (
                              <EpisodeCard
                                key={episode.id}
                                episode={episode}
                                isSelected={selectedEpisode?.id === episode.id}
                                onSelect={() =>
                                  setSelectedEpisode({
                                    ...episode,
                                    folderPath,
                                  })
                                }
                                onPlay={() => handlePlay(episode.id)}
                                onDelete={(e) => handleDelete(episode.id, e)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Standalone Movies */}
          {standaloneFiles.length > 0 && (
            <div>
              <h2
                style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 700,
                  color: "var(--text)",
                  fontFamily: "var(--font-display)",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <IconFilm size={20} color="var(--text)" />
                Movies
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "clamp(12px, 3vw, 16px)",
                }}
              >
                {standaloneFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onPlay={() => handlePlay(file.id)}
                    onDelete={(e) => handleDelete(file.id, e)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Episode card component for series episodes
function EpisodeCard({ episode, isSelected, onSelect, onPlay, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => {
        onSelect();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        background: isSelected ? "var(--accent)" : "var(--surface)",
        cursor: "pointer",
        transition: "all 0.2s",
        border: isSelected
          ? "2px solid var(--accent)"
          : "1px solid var(--border)",
        aspectRatio: "16/9",
        transform: hovered || isSelected ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Thumbnail background */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: isSelected
            ? "linear-gradient(135deg, rgba(231,76,60,0.2), rgba(231,76,60,0.1))"
            : "linear-gradient(135deg, rgba(245,200,66,0.1), rgba(52,152,219,0.1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {isSelected && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
            }}
          />
        )}
      </div>

      {/* File info overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.95), transparent)"
            : "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          padding: "12px",
          transition: "all 0.2s",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-body)",
          }}
        >
          {episode.filename}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--text3)",
            margin: "4px 0 0 0",
            fontFamily: "var(--font-body)",
          }}
        >
          {formatDuration(episode.durationSeconds)}
        </p>
      </div>

      {/* Hover overlay with play and delete buttons */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 5,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(231, 76, 60, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="Play episode"
          >
            <IconPlay size={20} color="#fff" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: "rgba(231, 76, 60, 0.8)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(231, 76, 60, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(231, 76, 60, 0.8)";
            }}
            title="Delete episode"
          >
            <IconTrash size={16} color="#fff" />
          </button>
        </div>
      )}

      {/* Progress bar */}
      {episode.watchProgress > 0 && episode.watchProgress < 100 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            width: `${episode.watchProgress}%`,
            background: "var(--accent)",
            transition: "width 0.3s",
            zIndex: 6,
          }}
        />
      )}

      {/* Watched indicator */}
      {episode.watchProgress === 100 && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "var(--accent)",
            color: "#fff",
            padding: "4px 6px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            zIndex: 6,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}

// File card component for standalone movies
function FileCard({ file, onPlay, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onPlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        background: "var(--surface)",
        cursor: "pointer",
        transition: "all 0.2s",
        border: "1px solid var(--border)",
        aspectRatio: "16/9",
        transform: hovered ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Thumbnail background */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(245,200,66,0.1), rgba(52,152,219,0.1))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconPlay size={32} color="rgba(255,255,255,0.6)" />
      </div>

      {/* File info overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: hovered
            ? "linear-gradient(to top, rgba(0,0,0,0.95), transparent)"
            : "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
          padding: "12px",
          transition: "all 0.2s",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-body)",
          }}
        >
          {file.filename}
        </p>
        <p
          style={{
            fontSize: 11,
            color: "var(--text3)",
            margin: "4px 0 0 0",
            fontFamily: "var(--font-body)",
          }}
        >
          {formatDuration(file.durationSeconds)}
        </p>
      </div>

      {/* Hover overlay with play and delete buttons */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            zIndex: 5,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(231, 76, 60, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="Play movie"
          >
            <IconPlay size={24} color="#fff" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: "rgba(231, 76, 60, 0.8)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(231, 76, 60, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(231, 76, 60, 0.8)";
            }}
            title="Delete file"
          >
            <IconTrash size={16} color="#fff" />
          </button>
        </div>
      )}

      {/* Progress bar */}
      {file.watchProgress > 0 && file.watchProgress < 100 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            width: `${file.watchProgress}%`,
            background: "var(--accent)",
            transition: "width 0.3s",
            zIndex: 6,
          }}
        />
      )}

      {/* Watched indicator */}
      {file.watchProgress === 100 && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "var(--accent)",
            color: "#fff",
            padding: "4px 6px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            zIndex: 6,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
