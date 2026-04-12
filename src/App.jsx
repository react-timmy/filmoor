import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import QueuePanel from './components/QueuePanel';
import Home from './pages/Home';
import Library from './pages/Library';
import { useLibrary } from './hooks/useLibrary';

export default function App() {
  const {
    library, queue, isProcessing, processingCount,
    processFiles, updateItem, removeItem,
    movies, series, watching, recentlyWatched, recentlyAdded,
  } = useLibrary();

  const [queueDismissed, setQueueDismissed] = useState(false);

  const showQueue = queue.length > 0 && !queueDismissed;

  const handleNewFiles = (files) => {
    setQueueDismissed(false);
    processFiles(files);
  };

  return (
    <BrowserRouter>
      <Navbar
        onScan={handleNewFiles}
        isProcessing={isProcessing}
        processingCount={processingCount}
        library={library}
      />

      <Routes>
        <Route path="/" element={
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
        } />
        <Route path="/library" element={
          <Library
            library={library}
            movies={movies}
            series={series}
            updateItem={updateItem}
            removeItem={removeItem}
          />
        } />
      </Routes>

      {/* Floating queue panel */}
      {showQueue && (
        <QueuePanel
          queue={queue}
          onDismiss={() => setQueueDismissed(true)}
        />
      )}
    </BrowserRouter>
  );
}
