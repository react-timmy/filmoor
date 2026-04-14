// TMDB API helper — add your free key from https://www.themoviedb.org/settings/api
export const TMDB_KEY = import.meta.env.VITE_TMDB_KEY || 'be9ca528fcf90531cf687c11c26a4c90';  // Load from environment variable
const BASE = 'https://api.themoviedb.org/3';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_W1280 = 'https://image.tmdb.org/t/p/w1280';
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

const MOCK_GENRES = ['Action','Drama','Thriller','Comedy','Sci-Fi','Horror','Animation','Crime','Romance','Adventure','Fantasy','Mystery'];
const MOCK_OVERVIEWS = [
  'A gripping story that unfolds across unexpected twists. Add your TMDB API key for real descriptions.',
  'An unforgettable journey that challenges everything you know. Paste your TMDB key to unlock full metadata.',
  'Critically acclaimed and visually stunning. Add a free TMDB key at src/utils/tmdb.js for posters & details.',
];

function mockMeta(title, type) {
  return {
    poster: null, backdrop: null,
    overview: MOCK_OVERVIEWS[Math.abs(title.charCodeAt(0) + title.length) % MOCK_OVERVIEWS.length],
    rating: ((title.charCodeAt(0) % 30) / 10 + 6).toFixed(1),
    genre: MOCK_GENRES[Math.abs(title.charCodeAt(0) * title.length) % MOCK_GENRES.length],
    genres: [MOCK_GENRES[Math.abs(title.charCodeAt(0) * title.length) % MOCK_GENRES.length]],
    runtime: type === 'tv' ? null : 85 + (title.charCodeAt(0) % 60),
    tmdbId: null,
    dominantColor: '#1a2030',
  };
}

export async function fetchTMDB(title, year, type = 'movie') {
  if (!TMDB_KEY) return mockMeta(title, type);

  try {
    const endpoint = (type === 'tv' || type === 'anime') ? 'search/tv' : 'search/movie';
    const url = `${BASE}/${endpoint}?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}${year ? `&year=${year}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return mockMeta(title, type);
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) return mockMeta(title, type);

    // Fetch genre details if we have an ID
    let genres = [];
    let runtime = null;
    try {
      const detailEndpoint = (type === 'tv' || type === 'anime') ? `tv/${r.id}` : `movie/${r.id}`;
      const detail = await fetch(`${BASE}/${detailEndpoint}?api_key=${TMDB_KEY}`).then(r => r.json());
      genres = detail.genres?.map(g => g.name) || [];
      runtime = detail.runtime || detail.episode_run_time?.[0] || null;
    } catch {}

    return {
      poster: r.poster_path ? IMG_W500 + r.poster_path : null,
      backdrop: r.backdrop_path ? IMG_W1280 + r.backdrop_path : null,
      backdropOriginal: r.backdrop_path ? IMG_ORIGINAL + r.backdrop_path : null,
      overview: r.overview || '',
      rating: r.vote_average ? r.vote_average.toFixed(1) : null,
      genre: genres[0] || null,
      genres,
      runtime,
      tmdbId: r.id,
      dominantColor: '#1a2030',
    };
  } catch {
    return mockMeta(title, type);
  }
}

export function posterUrl(path) { return path ? IMG_W500 + path : null; }
export function backdropUrl(path) { return path ? IMG_W1280 + path : null; }
