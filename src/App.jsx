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
  const { user, selectedProfile, loading } = useAuth();
  const [queueDismissed, setQueueDismissed] = useState(false);

  // Always call hooks (they handle null profileId internally)
  const libraryHooks = useLibrary();
  const localLibraryHooks = useLocalLibrary();

  // Provide default empty values if hooks aren't initialized
  const {
    library = [],
    queue = [],
    isProcessing = false,
    processingCount = 0,
    processFiles = () => {},
    updateItem = () => {},
    removeItem = () => {},
    clearRecentlyAdded = () => {},
    clearRecentlyAddedExceptLast = () => {},
    movies = [],
    series = [],
    watching = [],
    recentlyWatched = [],
    recentlyAdded = [],
  } = libraryHooks || {};

  const { localLibrary = [], addLocalFiles = () => {}, clearRecentlyAddedLocal = () => {} } =
    localLibraryHooks || {};

  const showQueue = queue.length > 0 && !queueDismissed;

  const handleNewFiles = (files) => {
    setQueueDismissed(false);
    if (processFiles) processFiles(files);
    if (addLocalFiles) addLocalFiles(files);
  };

  return (
    <>
      {user && selectedProfile && (
        <Navbar
          onScan={handleNewFiles}
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
                  clearRecentlyAddedExceptLast={clearRecentlyAddedExceptLast}
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
