import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalLibrary } from "../hooks/useLocalLibrary";
import VideoPlayer from "../components/VideoPlayer";
import { IconClose, IconTrash } from "../components/Icons";

export default function LocalPlayer({ localLibrary }) {
  const navigate = useNavigate();
  const { fileId } = useParams();
  const { updateLocalFile, removeLocalFile, getBlobUrl } = useLocalLibrary();
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentFile = localLibrary.find((f) => f.id === fileId);

  // Get all episodes in the same series/folder
  const getEpisodesInSeries = () => {
    if (!currentFile) return [];

    const currentRelativePath =
      currentFile.relativePath || currentFile.filename;
    const currentPathParts = currentRelativePath.split("/");

    if (currentPathParts.length <= 1) return []; // Standalone file, no series

    const seriesFolderPath = currentPathParts.slice(0, -1).join("/");

    return localLibrary
      .filter((file) => {
        const relativePath = file.relativePath || file.filename;
        const pathParts = relativePath.split("/");

        if (pathParts.length <= 1) return false;

        const folderPath = pathParts.slice(0, -1).join("/");
        return folderPath === seriesFolderPath;
      })
      .sort((a, b) => {
        // Sort by filename to maintain episode order
        return (a.filename || "").localeCompare(b.filename || "");
      });
  };

  const episodes = getEpisodesInSeries();
  const currentEpisodeIndex = episodes.findIndex((e) => e.id === fileId);

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      navigate(`/local-player/${episodes[currentEpisodeIndex + 1].id}`);
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      navigate(`/local-player/${episodes[currentEpisodeIndex - 1].id}`);
    }
  };

  const handleSelectEpisode = (episodeId) => {
    navigate(`/local-player/${episodeId}`);
  };

  useEffect(() => {
    const loadBlobUrl = async () => {
      if (fileId) {
        setIsLoading(true);
        const url = await getBlobUrl(fileId);
        setBlobUrl(url);
        setIsLoading(false);
      }
    };

    loadBlobUrl();
  }, [fileId, getBlobUrl]);

  const handleBack = () => {
    navigate("/");
  };

  const handleUpdateProgress = (progress, currentTime) => {
    if (fileId) {
      updateLocalFile(fileId, {
        watchProgress: progress,
        lastWatched: new Date().toISOString(),
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this file from your library?")) {
      await removeLocalFile(fileId);
      navigate("/");
    }
  };

  if (!currentFile) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          color: "var(--text)",
          fontSize: 18,
          fontFamily: "var(--font-body)",
        }}
      >
        File not found
      </div>
    );
  }

  if (isLoading || !blobUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontSize: 18,
          fontFamily: "var(--font-body)",
        }}
      >
        Loading video...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Video player */}
      <div style={{ flex: 1, position: "relative" }}>
        <VideoPlayer
          src={blobUrl}
          title={currentFile.filename}
          initialProgress={currentFile.watchProgress || 0}
          onBack={handleBack}
          onUpdateProgress={handleUpdateProgress}
          episodes={episodes}
          currentEpisodeIndex={currentEpisodeIndex}
          onSelectEpisode={handleSelectEpisode}
          onNextEpisode={handleNextEpisode}
          onPrevEpisode={handlePrevEpisode}
        />

        {/* Delete button overlay */}
        <button
          onClick={handleDelete}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "rgba(231, 76, 60, 0.2)",
            border: "1px solid rgba(231, 76, 60, 0.4)",
            color: "#e74c3c",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            zIndex: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(231, 76, 60, 0.3)";
            e.currentTarget.style.borderColor = "rgba(231, 76, 60, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(231, 76, 60, 0.2)";
            e.currentTarget.style.borderColor = "rgba(231, 76, 60, 0.4)";
          }}
          title="Delete this file"
        >
          <IconTrash size={18} color="#e74c3c" />
        </button>
      </div>
    </div>
  );
}
