import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";

const STORAGE_KEY_PREFIX = "filmsort_local_library_";
const DB_NAME = "FilmSortLocalDB";
const STORE_NAME = "localFiles";

// Initialize IndexedDB for storing local files
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

// Load local files metadata from localStorage
function loadLocalLibrary(profileId) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${profileId}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Save local files metadata to localStorage
function saveLocalLibrary(items, profileId) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${profileId}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}

// Store file in IndexedDB
async function storeFileInDB(id, file) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.put({ id, file });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Error storing file in DB:", err);
    return false;
  }
}

// Retrieve file from IndexedDB
async function getFileFromDB(id) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.file || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Error retrieving file from DB:", err);
    return null;
  }
}

// Delete file from IndexedDB
async function deleteFileFromDB(id) {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Error deleting file from DB:", err);
    return false;
  }
}

// Get video duration
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
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(null);
    }, 5000);
  });
}

export function useLocalLibrary() {
  const { selectedProfile } = useAuth();
  const profileId = selectedProfile?._id;
  const [localLibrary, setLocalLibrary] = useState(() =>
    loadLocalLibrary(profileId),
  );
  const [blobUrls, setBlobUrls] = useState({}); // Map of id -> blob URL

  // Load library when profile changes
  useEffect(() => {
    if (profileId) {
      setLocalLibrary(loadLocalLibrary(profileId));
      setBlobUrls({});
    }
  }, [profileId]);

  // Save library when it changes
  useEffect(() => {
    if (profileId) saveLocalLibrary(localLibrary, profileId);
  }, [localLibrary, profileId]);

  // Add local files
  const addLocalFiles = useCallback(async (files) => {
    const videoFiles = files.filter((f) =>
      /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|m2ts)$/i.test(f.name),
    );
    if (!videoFiles.length) return;

    const newItems = [];

    for (const file of videoFiles) {
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      try {
        // Get duration
        const duration = await getVideoDuration(file);

        // Create blob URL
        const blobUrl = URL.createObjectURL(file);

        // Store file in IndexedDB
        await storeFileInDB(id, file);

        // Get relative path if available (for folder uploads)
        const relativePath = file.webkitRelativePath || file.name;

        // Create metadata entry
        const entry = {
          id,
          filename: file.name,
          fileSize: file.size,
          durationSeconds: duration || 0,
          watchProgress: 0,
          watchCount: 0,
          lastWatched: null,
          addedAt: new Date().toISOString(),
          blobUrl,
          relativePath, // Preserve folder structure
        };

        newItems.push(entry);

        // Store blob URL
        setBlobUrls((prev) => ({ ...prev, [id]: blobUrl }));
      } catch (err) {
        console.error("Error adding file:", err);
      }
    }

    if (newItems.length) {
      setLocalLibrary((prev) => {
        const existing = new Set(prev.map((p) => p.filename));
        const filtered = newItems.filter(
          (item) => !existing.has(item.filename),
        );
        return [...prev, ...filtered];
      });
    }
  }, []);

  // Update local file
  const updateLocalFile = useCallback((id, patch) => {
    setLocalLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  // Remove local file
  const removeLocalFile = useCallback(
    async (id) => {
      await deleteFileFromDB(id);

      // Revoke blob URL
      if (blobUrls[id]) {
        URL.revokeObjectURL(blobUrls[id]);
      }

      setBlobUrls((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      setLocalLibrary((prev) => prev.filter((item) => item.id !== id));
    },
    [blobUrls],
  );

  // Get blob URL for a file
  const getBlobUrl = useCallback(
    async (id) => {
      // If already in memory, return it
      if (blobUrls[id]) {
        return blobUrls[id];
      }

      // Otherwise try to retrieve from IndexedDB and recreate blob URL
      const file = await getFileFromDB(id);
      if (file) {
        const url = URL.createObjectURL(file);
        setBlobUrls((prev) => ({ ...prev, [id]: url }));
        return url;
      }

      return null;
    },
    [blobUrls],
  );

  // Clear recently added local files
  const clearRecentlyAddedLocal = useCallback(() => {
    setLocalLibrary((prev) =>
      prev.map((item) => ({
        ...item,
        addedAt: new Date(0).toISOString(), // Jan 1, 1970
      })),
    );
  }, []);

  return {
    localLibrary,
    blobUrls,
    addLocalFiles,
    updateLocalFile,
    removeLocalFile,
    getBlobUrl,
    clearRecentlyAddedLocal,
  };
}
