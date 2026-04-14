import { useState, useCallback, useEffect } from "react";
import {
  parseFilename,
  checkDuration,
  getSuggestedPath,
  MIN_DURATION_SECONDS,
} from "../utils/parser";
import { fetchTMDB } from "../utils/tmdb";
import { useAuth } from "../hooks/useAuth";

const STORAGE_KEY_PREFIX = "filmsort_library_profile_";

function loadLibrary(profileId) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${profileId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLibrary(items, profileId) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${profileId}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

// Try to read video duration from the File object
async function getVideoDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(isFinite(video.duration) ? video.duration : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
    // Timeout fallback
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(null);
    }, 5000);
  });
}

export function useLibrary() {
  const { selectedProfile } = useAuth();
  const profileId = selectedProfile?._id;
  const [library, setLibrary] = useState(() => loadLibrary(profileId));
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);

  // Load library when profile changes
  useEffect(() => {
    if (profileId) {
      setLibrary(loadLibrary(profileId));
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId) saveLibrary(library, profileId);
  }, [library, profileId]);

  const processFiles = useCallback(async (files) => {
    const videoFiles = files.filter((f) =>
      /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|m2ts)$/i.test(f.name),
    );
    if (!videoFiles.length) return;

    setIsProcessing(true);
    setProcessingCount(videoFiles.length);

    const initial = videoFiles.map((f, i) => ({
      id: `q-${Date.now()}-${i}`,
      file: f,
      status: "queued", // queued | checking | analyzing | done | rejected | error
      rejectReason: null,
      parsed: null,
    }));
    setQueue(initial);

    const results = [];

    for (let i = 0; i < initial.length; i++) {
      const qItem = initial[i];

      // Step 1: Check duration
      setQueue((q) =>
        q.map((r, idx) => (idx === i ? { ...r, status: "checking" } : r)),
      );
      const duration = await getVideoDuration(qItem.file);
      const durationCheck = checkDuration(duration);

      if (!durationCheck.ok) {
        setQueue((q) =>
          q.map((r, idx) =>
            idx === i
              ? { ...r, status: "rejected", rejectReason: durationCheck.reason }
              : r,
          ),
        );
        setProcessingCount((c) => c - 1);
        continue;
      }

      // Step 2: Parse filename
      setQueue((q) =>
        q.map((r, idx) => (idx === i ? { ...r, status: "analyzing" } : r)),
      );

      try {
        const parsed = parseFilename(qItem.file.name);

        // Step 3: TMDB enrichment
        const meta = await fetchTMDB(parsed.title, parsed.year, parsed.type);

        const entry = {
          id: `lib-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          filename: qItem.file.name,
          fileSize: qItem.file.size,
          durationSeconds: duration,
          // Parsed fields
          title: parsed.title,
          year: parsed.year,
          type: parsed.type,
          seasonNumber: parsed.seasonNumber,
          episodeNumber: parsed.episodeNumber,
          episodeEnd: parsed.episodeEnd,
          episodeTitle: parsed.episodeTitle,
          cleanedFilename: parsed.cleanedFilename,
          confidence: parsed.confidence,
          isMultiEpisode: parsed.isMultiEpisode || false,
          isSpecial: parsed.isSpecial || false,
          isPart: parsed.isPart || false,
          // TMDB fields
          poster: meta?.poster || null,
          backdrop: meta?.backdrop || null,
          backdropOriginal: meta?.backdropOriginal || null,
          overview: meta?.overview || "",
          rating: meta?.rating || null,
          genre: meta?.genre || null,
          genres: meta?.genres || [],
          runtime: meta?.runtime || null,
          tmdbId: meta?.tmdbId || null,
          dominantColor: meta?.dominantColor || "#1a2030",
          // User state
          status: "unwatched", // unwatched | watching | watched
          userRating: 0,
          watchProgress: 0, // 0-100
          watchCount: 0,
          lastWatched: null,
          addedAt: new Date().toISOString(),
          suggestedPath: getSuggestedPath({ ...parsed, genre: meta?.genre }),
        };

        results.push(entry);
        setQueue((q) =>
          q.map((r, idx) => (idx === i ? { ...r, status: "done", parsed } : r)),
        );
      } catch (err) {
        console.error("Parse error:", err);
        setQueue((q) =>
          q.map((r, idx) => (idx === i ? { ...r, status: "error" } : r)),
        );
      }

      setProcessingCount((c) => Math.max(0, c - 1));
      await new Promise((r) => setTimeout(r, 60));
    }

    if (results.length) {
      setLibrary((prev) => {
        const existing = new Set(prev.map((p) => p.filename));
        const newItems = results.filter((r) => !existing.has(r.filename));
        return [...prev, ...newItems];
      });
    }

    setIsProcessing(false);
  }, []);

  const updateItem = useCallback((id, patch) => {
    setLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const removeItem = useCallback((id) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearLibrary = useCallback(() => {
    setLibrary([]);
    setQueue([]);
  }, []);

  // Derived collections
  const movies = library.filter((i) => i.type === "movie");
  const tvShows = library.filter((i) => i.type === "tv" || i.type === "anime");
  const watching = library.filter((i) => i.status === "watching");
  const recentlyWatched = library
    .filter((i) => i.lastWatched)
    .sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched))
    .slice(0, 20);
  const recentlyAdded = [...library]
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .slice(0, 20);
  const watched = library.filter((i) => i.status === "watched");

  // Group TV shows by series title
  const seriesMap = tvShows.reduce((acc, ep) => {
    const key = `${ep.title}::${ep.seasonNumber}`;
    if (!acc[key])
      acc[key] = {
        title: ep.title,
        season: ep.seasonNumber,
        type: ep.type,
        episodes: [],
        poster: ep.poster,
        backdrop: ep.backdrop,
        genre: ep.genre,
        overview: ep.overview,
      };
    acc[key].episodes.push(ep);
    return acc;
  }, {});
  const series = Object.values(seriesMap).map((s) => ({
    ...s,
    episodes: s.episodes.sort(
      (a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0),
    ),
    episodeCount: s.episodes.length,
    id: `series-${s.title}-${s.season}`,
  }));

  return {
    library,
    queue,
    isProcessing,
    processingCount,
    processFiles,
    updateItem,
    removeItem,
    clearLibrary,
    movies,
    tvShows,
    series,
    watching,
    recentlyWatched,
    recentlyAdded,
    watched,
  };
}
