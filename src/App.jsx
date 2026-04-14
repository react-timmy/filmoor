import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import QueuePanel from "./components/QueuePanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Library from "./pages/Library";
import LocalLibrary from "./pages/LocalLibrary";
import LocalPlayer from "./pages/LocalPlayer";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import { useLibrary } from "./hooks/useLibrary";
import { useLocalLibrary } from "./hooks/useLocalLibrary";

function AppContent() {
  const { user, selectedProfile } = useAuth();
  const {
    library,
    queue,
    isProcessing,
    processingCount,
    processFiles,
    updateItem,
    removeItem,
    clearRecentlyAdded,
    movies,
    series,
    watching,
    recentlyWatched,
    recentlyAdded,
  } = useLibrary();

  const { localLibrary, addLocalFiles, clearRecentlyAddedLocal } =
    useLocalLibrary();

  const [queueDismissed, setQueueDismissed] = useState(false);

  const showQueue = queue.length > 0 && !queueDismissed;

  const handleNewFiles = (files) => {
    setQueueDismissed(false);
    processFiles(files);
    // Also add files to local library
    addLocalFiles(files);
  };

  const handleLocalUpload = (files) => {
    addLocalFiles(files);
  };

  return (
    <>
      {user && selectedProfile && (
        <Navbar
          onScan={handleNewFiles}
          onLocalUpload={handleLocalUpload}
          isProcessing={isProcessing}
          processingCount={processingCount}
          library={library}
        />
      )}

      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/profiles"
          element={
            <ProtectedRoute>
              <Profiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {selectedProfile ? (
                <Home
                  library={library}
                  localLibrary={localLibrary}
                  movies={movies}
                  series={series}
                  watching={watching}
                  recentlyWatched={recentlyWatched}
                  recentlyAdded={recentlyAdded}
                  updateItem={updateItem}
                  clearRecentlyAdded={clearRecentlyAdded}
                  clearRecentlyAddedLocal={clearRecentlyAddedLocal}
                  processFiles={handleNewFiles}
                />
              ) : (
                <Navigate to="/profiles" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              {selectedProfile ? (
                <Library
                  library={library}
                  movies={movies}
                  series={series}
                  updateItem={updateItem}
                  removeItem={removeItem}
                />
              ) : (
                <Navigate to="/profiles" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/local-library"
          element={
            <ProtectedRoute>
              {selectedProfile ? (
                <LocalLibrary />
              ) : (
                <Navigate to="/profiles" replace />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/local-player/:fileId"
          element={
            <ProtectedRoute>
              {selectedProfile ? (
                <LocalPlayer localLibrary={localLibrary} />
              ) : (
                <Navigate to="/profiles" replace />
              )}
            </ProtectedRoute>
          }
        />
        {/* Catch-all: redirect unmatched routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating queue panel */}
      {showQueue && (
        <QueuePanel queue={queue} onDismiss={() => setQueueDismissed(true)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
