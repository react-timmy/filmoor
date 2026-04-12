import { useState } from 'react';
import { PosterCard, SeriesCard } from '../components/Cards';
import DetailModal from '../components/DetailModal';
import EpisodeModal from '../components/EpisodeModal';
import { IconFilm, IconTV, IconSearch, IconLibrary } from '../components/Icons';

export default function Library({ library, movies, series, updateItem }) {
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('added');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);

  if (library.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 14px', textAlign: 'center' }}>
        <IconLibrary size={48} color="var(--text3)" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: 2, marginTop: 16, marginBottom: 8 }}>MY LIBRARY</div>
        <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 20 }}>Scan files from Home to fill your vault</div>
        <div style={{ color: 'var(--text3)', fontSize: 11, padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 9 }}>
          Go to Home → tap Scan Files or drag & drop videos
        </div>
      </div>
    );
  }

  const filteredMovies = (filter === 'shows' ? [] : movies).filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'rating') return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    if (sort === 'year') return (b.year || 0) - (a.year || 0);
    return new Date(b.addedAt) - new Date(a.addedAt);
  });

  const filteredSeries = (filter === 'movies' ? [] : series).filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : 0);

  const total = filteredMovies.length + filteredSeries.length;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'var(--nav-top)', paddingBottom: 'clamp(24px,4vw,60px)' }}>
      {/* Header */}
      <div className="page-pad" style={{ paddingTop: 20, paddingBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,5vw,34px)', letterSpacing: 3, color: 'var(--text)' }}>
            MY LIBRARY
          </h1>
          <span style={{ color: 'var(--text3)', fontSize: 13 }}>{library.length} files</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <IconSearch size={15} color="var(--text3)" />
          </div>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search titles…"
            style={{
              width: '100%', maxWidth: 360,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '9px 14px 9px 38px', fontSize: 13,
              color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[['all','All'], ['movies','Movies'], ['shows','TV & Anime']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: '6px 14px', borderRadius: 99,
                border: `1px solid ${filter === k ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)'}`,
                background: filter === k ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === k ? 'var(--text)' : 'var(--text2)',
                fontSize: 12, fontWeight: filter === k ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-body)',
              }}>{l}</button>
            ))}
          </div>

          {/* Status pills — only when movies visible */}
          {filter !== 'shows' && (
            <div style={{ display: 'flex', gap: 5 }}>
              {[['all','Any'], ['unwatched','Unwatched'], ['watching','Watching'], ['watched','Watched']].map(([k, l]) => (
                <button key={k} onClick={() => setStatusFilter(k)} style={{
                  padding: '5px 11px', borderRadius: 99,
                  border: `1px solid ${statusFilter === k ? 'var(--green)' : 'rgba(255,255,255,0.1)'}`,
                  background: statusFilter === k ? 'rgba(61,220,132,0.1)' : 'transparent',
                  color: statusFilter === k ? 'var(--green)' : 'var(--text3)',
                  fontSize: 11, cursor: 'pointer', transition: 'all 0.14s', fontFamily: 'var(--font-body)',
                }}>{l}</button>
              ))}
            </div>
          )}

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            marginLeft: 'auto',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 12px', fontSize: 12,
            color: 'var(--text)', cursor: 'pointer', outline: 'none',
            fontFamily: 'var(--font-body)',
          }}>
            <option value="added">Recently Added</option>
            <option value="title">Title A–Z</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <div style={{ marginTop: 12, color: 'var(--text3)', fontSize: 12 }}>
          {total} result{total !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}
        </div>
      </div>

      {/* Series section */}
      {filteredSeries.length > 0 && (
        <div className="page-pad" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
            <IconTV size={15} color="var(--text3)" />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Series & Anime · {filteredSeries.length}
            </h2>
          </div>
          <div className="poster-grid">
            {filteredSeries.map(s => <SeriesCard key={s.id} series={s} onClick={setSelectedSeries} />)}
          </div>
        </div>
      )}

      {/* Movies section */}
      {filteredMovies.length > 0 && (
        <div className="page-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
            <IconFilm size={15} color="var(--text3)" />
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>
              Movies · {filteredMovies.length}
            </h2>
          </div>
          <div className="poster-grid">
            {filteredMovies.map(item => <PosterCard key={item.id} item={item} onClick={setSelectedItem} showProgress />)}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <IconSearch size={36} color="var(--text3)" />
          <div style={{ marginTop: 12, fontSize: 14 }}>No results match your filters</div>
        </div>
      )}

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={(id, patch) => { updateItem(id, patch); setSelectedItem(p => ({ ...p, ...patch })); }}
        />
      )}
      {selectedSeries && (
        <EpisodeModal
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
          onEpisodeClick={ep => { setSelectedSeries(null); setSelectedItem(ep); }}
        />
      )}
    </div>
  );
}
