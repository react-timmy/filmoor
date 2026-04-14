import { useState } from "react";
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
} from "../components/Icons";

export default function Home({
  library,
  movies,
  series,
  watching,
  recentlyWatched,
  recentlyAdded,
  updateItem,
  processFiles,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [filter, setFilter] = useState("all"); // all | movies | shows

  if (library.length === 0) return <Onboarding onFiles={processFiles} />;

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
    <div
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        paddingBottom: "clamp(24px,4vw,60px)",
      }}
    >
      {/* Hero — starts at top, bleeds edge to edge */}
      <Hero item={heroItem} onInfo={setSelectedItem} />

      {/* Max-width container for desktop */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        {/* Filter pills + stats — just below hero */}
        <div
          className="page-pad"
          style={{
            marginTop: -10,
            marginBottom: 28,
            position: "relative",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Filter pills — outlined, active = slightly filled */}
          <div style={{ display: "flex", gap: 7 }}>
            {[
              ["all", "All"],
              ["movies", "Movies"],
              ["shows", "Shows"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 99,
                  border: `1px solid ${filter === k ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.18)"}`,
                  background:
                    filter === k ? "rgba(255,255,255,0.12)" : "transparent",
                  color: filter === k ? "var(--text)" : "var(--text2)",
                  fontSize: 13,
                  fontWeight: filter === k ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: "var(--font-body)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Stats strip */}
          <div
            style={{
              display: "flex",
              gap: "clamp(12px,3vw,22px)",
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            {[
              [stats.movies, stats.movies === 1 ? "Movie" : "Movies"],
              [stats.series, stats.series === 1 ? "Series" : "Series Folders"],
              [stats.watched, "Watched"],
            ].map(([n, l]) => (
              <div
                key={l}
                style={{ display: "flex", alignItems: "baseline", gap: 4 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(16px,3.5vw,20px)",
                    color: "var(--text)",
                  }}
                >
                  {n}
                </span>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Watching */}
        {watching.length > 0 && (
          <Carousel title="Continue Watching" icon={IconPause}>
            {watching.map((item) => (
              <WideCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </Carousel>
        )}

        {/* Recently Watched */}
        {recentlyWatched.length > 0 && (
          <Carousel title="Recently Watched" icon={IconClock}>
            {recentlyWatched.map((item) => (
              <WideCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </Carousel>
        )}

        {/* Movies */}
        {showMovies && movies.length > 0 && (
          <Carousel title="Movies" icon={IconFilm}>
            {movies.map((item) => (
              <PosterCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </Carousel>
        )}

        {/* Series & Anime */}
        {showSeries && series.length > 0 && (
          <Carousel title="Series & Anime" icon={IconTV}>
            {series.map((s) => (
              <SeriesCard key={s.id} series={s} onClick={setSelectedSeries} />
            ))}
          </Carousel>
        )}

        {/* Recently Added */}
        {recentlyAdded.length > 0 && (
          <Carousel title="Recently Added" icon={IconSparkle}>
            {recentlyAdded.map((item) => (
              <PosterCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </Carousel>
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
