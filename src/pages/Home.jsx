import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import {
  Carousel,
  PosterCard,
  WideCard,
  SeriesCard,
} from "../components/Cards";
import Onboarding from "../components/Onboarding";
import DetailModal from "../components/DetailModal";
import EpisodeModal from "../components/EpisodeModal";
import {
  IconFilm,
  IconTV,
  IconClock,
  IconSparkle,
  IconPause,
  IconSearch,
  IconDownload,
} from "../components/Icons";

export default function Home({
  library,
  localLibrary,
  movies,
  series,
  watching,
  recentlyWatched,
  recentlyAdded,
  updateItem,
  clearRecentlyAdded,
  clearRecentlyAddedLocal,
  clearRecentlyAddedExceptLast,
  processFiles,
}) {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [filter, setFilter] = useState("all"); // all | movies | shows

  // Handler for playing local files
  const handlePlayLocal = (fileId) => {
    navigate(`/local-player/${fileId}`);
  };

  // Handler for playing or viewing items (local or API)
  const handleItemClick = (item, isLocal = false) => {
    if (isLocal || item.isLocal) {
      handlePlayLocal(item.id);
    } else {
      setSelectedItem(item);
    }
  };

  if (library.length === 0 && (!localLibrary || localLibrary.length === 0))
    return <Onboarding onFiles={processFiles} />;

  const heroItem =
    [...library]
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .find((i) => i.backdrop) || library[library.length - 1];

  const stats = {
    movies: movies.length,
    series: series.length,
    watched: library.filter((i) => i.status === "watched").length,
  };

  const showMovies = filter !== "shows";
  const showSeries = filter !== "movies";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D1620] via-[#1a0f14] to-[#070910]">
      {/* Netflix Header - Premium Dark UI */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#2D1620] to-[#1a0f14] border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
              <span className="text-white font-bebas text-xl font-black">N</span>
            </div>
            <h1 className="text-2xl font-bebas text-white tracking-wider">Home</h1>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <IconDownload size={24} color="white" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <IconSearch size={24} color="white" />
            </button>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="px-4 sm:px-6 pb-4 flex gap-3 overflow-x-auto scrollbar-hide">
          {[
            ["all", "Shows"],
            ["movies", "Movies"],
            ["shows", "Categories"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-200 whitespace-nowrap font-medium text-sm ${
                filter === k
                  ? "border-white bg-white/10 text-white"
                  : "border-white/30 text-white/70 hover:border-white/50"
              }`}
            >
              {l}
              {k === "shows" && <span className="ml-2">▼</span>}
            </button>
          ))}
        </div>
      </header>

      {/* Hero — Featured Content Card */}
      <Hero item={heroItem} onInfo={setSelectedItem} onPlay={handlePlayLocal} />

      {/* Max-width container for desktop */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        {/* Stats Section — below hero */}
        <div
          className="py-6 sm:py-8 -mt-2 sm:-mt-4 relative z-5 flex flex-wrap items-baseline gap-6 sm:gap-8"
        >
          {[
            [stats.movies, stats.movies === 1 ? "Movie" : "Movies"],
            [stats.series, stats.series === 1 ? "Series" : "Series Folders"],
            [stats.watched, "Watched"],
          ].map(([n, l]) => (
            <div key={l} className="flex items-baseline gap-2">
              <span className="font-bebas text-2xl sm:text-3xl text-white tracking-wide">
                {n}
              </span>
              <span className="text-xs sm:text-sm text-gray-400">{l}</span>
            </div>
          ))}
        </div>

        {/* Continue Watching */}
        {watching.length > 0 && (
          <section className="py-8 border-t border-white/5">
            <Carousel title="Continue Watching" icon={IconPause}>
              {watching.map((item) => (
                <WideCard
                  key={item.id}
                  item={item}
                  onClick={(i) => handleItemClick(i, i.isLocal)}
                  onPlay={handlePlayLocal}
                />
              ))}
            </Carousel>
          </section>
        )}

        {/* Recently Watched */}
        {recentlyWatched.length > 0 && (
          <section className="py-8 border-t border-white/5">
            <Carousel title="Recently Watched" icon={IconClock}>
              {recentlyWatched.map((item) => (
                <WideCard
                  key={item.id}
                  item={item}
                  onClick={(i) => handleItemClick(i, i.isLocal)}
                  onPlay={handlePlayLocal}
                />
              ))}
            </Carousel>
          </section>
        )}

        {/* Movies */}
        {showMovies && movies.length > 0 && (
          <section className="py-8 border-t border-white/5">
            <Carousel title="Movies" icon={IconFilm}>
              {movies.map((item) => (
                <PosterCard
                  key={item.id}
                  item={item}
                  onClick={(i) => handleItemClick(i, i.isLocal)}
                  onPlay={handlePlayLocal}
                />
              ))}
            </Carousel>
          </section>
        )}

        {/* Series & Anime */}
        {showSeries && series.length > 0 && (
          <section className="py-8 border-t border-white/5">
            <Carousel title="Series & Anime" icon={IconTV}>
              {series.map((s) => (
                <SeriesCard key={s.id} series={s} onClick={setSelectedSeries} />
              ))}
            </Carousel>
          </section>
        )}

        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <section className="py-8 border-t border-white/5 pb-12">
            <Carousel 
              title="Recently Added" 
              icon={IconSparkle}
              onClear={() => clearRecentlyAddedExceptLast(5)}
            >
              {recentlyAdded.map((item) => (
                <PosterCard
                  key={item.id}
                  item={item}
                  onClick={(i) => handleItemClick(i, i.isLocal)}
                  onPlay={handlePlayLocal}
                />
              ))}
            </Carousel>
          </section>
        )}

        {/* Modals */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={(id, patch) => {
              updateItem(id, patch);
              setSelectedItem((p) => ({ ...p, ...patch }));
            }}
          />
        )}
        {selectedSeries && (
          <EpisodeModal
            series={selectedSeries}
            onClose={() => setSelectedSeries(null)}
            onEpisodeClick={(ep) => {
              setSelectedSeries(null);
              setSelectedItem(ep);
            }}
          />
        )}
      </div>
    </div>
  );
}
