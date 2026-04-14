import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import QueuePanel from "./components/QueuePanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Auth from "./pages/Auth";
import Profiles from "./pages/Profiles";
import { useLibrary } from "./hooks/useLibrary";

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
    movies,
    series,
    watching,
    recentlyWatched,
    recentlyAdded,
  } = useLibrary();

  const [queueDismissed, setQueueDismissed] = useState(false);

  const showQueue = queue.length > 0 && !queueDismissed;

  const handleNewFiles = (files) => {
    setQueueDismissed(false);
    processFiles(files);
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
                  movies={movies}
                  series={series}
                  watching={watching}
                  recentlyWatched={recentlyWatched}
                  recentlyAdded={recentlyAdded}
                  updateItem={updateItem}
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
