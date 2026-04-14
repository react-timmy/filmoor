import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocalLibrary } from "../hooks/useLocalLibrary";
import VideoPlayer from "../components/VideoPlayer";

export default function LocalPlayer({ localLibrary }) {
  const navigate = useNavigate();
  const { fileId } = useParams();
  const { updateLocalFile, getBlobUrl } = useLocalLibrary();
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
      </div>
    </div>
  );
}
