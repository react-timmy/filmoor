// ═══════════════════════════════════════════════════════════════════════
//  FilmSort — Advanced Media Filename Parser  v2.0
//  Handles: scene, P2P, anime fansubs, streaming rips, watermarks,
//           multi-episode, OVAs, specials, complete series packs
// ═══════════════════════════════════════════════════════════════════════

// ── Strip layers (order matters) ────────────────────────────────────────

const WEBSITE_WATERMARKS = [
  /\(?\s*(?:thenkiri|nkiri)\.?(?:com|ink|net|org)?\s*\)?/gi,
  /\(?\s*yts\.?\w{0,4}\s*\)?/gi,
  /\(?\s*(?:rarbg|ettv|eztv|yify|publichd|fmovies|ganool|pahe|torrentgalaxy)\s*\)?/gi,
  /\bwww\.[a-z0-9-]+\.[a-z]{2,6}\b/gi,
  /\[?\s*(?:Downloaded|Encoded|Ripped)\s+(?:from|by|@)\s+[^\]]+\]?/gi,
];

const RESOLUTION_PATTERN = /\b(?:2160|1080|720|540|480|360|240)p?\b/gi;

const NOISE_PATTERNS = [
  // Release group brackets — MUST come before quality strips
  /\[[^\]]*(?:raws?|subs?|dub|fansub|fansubber|bd|dvd|web|hdtv|release|encode|team|group|raw|v\d+?)\b[^\]]*\]/gi,
  /\[[a-zA-Z0-9_\-]{2,15}\]/g, // Short bracket groups [xdtk] [FGT]
  // Quality / source
  /\b(?:2160p|1080p|1080i|720p|540p|480p|480i|360p|4K|UHD|HD|SD)\b/gi,
  /\b(?:HDR10\+?|HDR|DV|Dolby\.?Vision|SDR|Hi10P?)\b/gi,
  /\b(?:BluRay|Blu-?Ray|BRRip|BDRip|BD|WEB-?DL|WEBRip|WEBDL|WEB|HDTV|DVDRip|DVDScr|DVD|CAM|TS|HDCAM|HDRIP|PROPER|REPACK|REMUX|Telesync|Syncup|PDVD|PreDVD)\b/gi,
  // Codec
  /\b(?:x\.?264|x\.?265|H\.?264|H\.?265|HEVC|AVC|XviD|DivX|VP9|AV1|10bit|10-bit|8bit|12bit)\b/gi,
  // Audio
  /\b(?:AAC(?:2\.0|5\.1)?|AC3|E-?AC3|DTS(?:-?HD|-?MA|-?X)?|FLAC|MP3|DD(?:5\.1|7\.1|P5\.1)?|(?:5|7)\.1|Atmos|TrueHD|LPCM|EAC3|Opus|Dual-?Audio|MultiAudio|Commentary|audio)\b/gi,
  // Streaming service tags
  /\b(?:AMZN|NF|Netflix|DSNP|Disney\+?|HULU|ATVP|AppleTV\+?|PCOK|Peacock|HBO|MAX|HBOMAX|Paramount\+?|CR|Crunchyroll|Funi|Funimation|VRV|HiDive|ADN|iT|iTunes|STAN|BCORE|PMTP|DPLAY|NLZIET|RTBF|SESTO|TVING)\b/gi,
  // Language tags
  /\b(?:MULTI(?:SUB|LANG)?|DUAL|TRIPLE|ENG(?:LISH)?|DUBBED?|SUBBED?|English\.?(?:Dub|Sub)|multisub|VOSTFR|FRENCH|SPANISH|GERMAN|ITALIAN|PORTUGUESE|JAPANESE|KOREAN|CHINESE|HINDI|ARABIC|RUSSIAN|POLISH|DUTCH|SWEDISH|NORWEGIAN|DANISH|FINNISH|TURKISH|THAI|VIETNAMESE|INDONESIAN|MALAY|TAGALOG|BRAZILIAN|LATIN|CZECH|HUNGARIAN|ROMANIAN|SLOVAK|BULGARIAN)\b/gi,
  // Edition / cut
  /\b(?:EXTENDED|UNRATED|DIRECTORS?\.?CUT|THEATRICAL|REMASTERED|RESTORED|CRITERION|SPECIAL\.?EDITION|IMAX|3D|ANNIVERSARY|COLLECTORS?|LIMITED|COMPLETE|ULTIMATE|REDUX|FINAL\.?CUT|OPEN\.?MATTE)\b/gi,
  // Misc garbage
  /\bbd-?\b/gi,
  /\b[Kk]s\b/g,
  /\bv\d+\b/gi,
  // Checksums and CRC32
  /\b[a-f0-9]{8}\b/gi,
  /\[[a-fA-F0-9]{8}\]/g,
  // Very long lowercase garbage
  /\b[a-z]{22,}\b/gi,
  // Empty brackets
  /[\[\(]\s*[\]\)]/g,
  // File extension
  /\.(?:mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|m2ts|vob|divx)$/i,
];

// ── Helper functions ────────────────────────────────────────────────────

function applyPatterns(str, patterns) {
  return patterns.reduce((s, p) => s.replace(p, " "), str);
}

function stripResolutions(s) {
  return s.replace(RESOLUTION_PATTERN, " ");
}

function stripAll(filename) {
  let s = filename;
  s = applyPatterns(s, WEBSITE_WATERMARKS);
  s = stripResolutions(s); // MUST be before noise (prevents 1080→episode)
  s = applyPatterns(s, NOISE_PATTERNS);
  return s;
}

function normalizeSpacing(s) {
  return s
    .replace(/[-_.+]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/-s\b/gi, "'s")
    .replace(/\s*-\s*/g, " - ")
    .trim();
}

const SMALL_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "but",
  "or",
  "for",
  "nor",
  "on",
  "at",
  "to",
  "by",
  "of",
  "in",
  "is",
  "vs",
  "via",
]);
const ROMAN = {
  i: "I",
  ii: "II",
  iii: "III",
  iv: "IV",
  v: "V",
  vi: "VI",
  vii: "VII",
  viii: "VIII",
  ix: "IX",
  x: "X",
};

function titleCase(s) {
  return s
    .toLowerCase()
    .split(" ")
    .map((w, i) => {
      if (!w) return w;
      if (ROMAN[w]) return ROMAN[w];
      if (w === "tv") return "TV";
      if (i > 0 && SMALL_WORDS.has(w)) return w;
      return w[0].toUpperCase() + w.slice(1);
    })
    .join(" ")
    .replace(/\bi\b/g, "I");
}

function extractYear(s) {
  // Match 4-digit years 1900-2029, avoid matching episode numbers
  const m = s.match(/(?<![Ee]\d{0,2})\b(19\d{2}|20[012]\d)\b(?!\s*[Ee]\d)/);
  return m ? parseInt(m[1]) : null;
}

function stripSeasonInTitle(title) {
  const m = title.match(/^(.+?)\s+(?:S(?:eason)?\s*)(\d{1,2})\s*$/i);
  if (m) return { cleanTitle: m[1].trim(), season: parseInt(m[2]) };
  return { cleanTitle: title, season: null };
}

function extractTitleFromFilename(filenameOrMatch) {
  // Remove year patterns (1900-2099)
  let t = filenameOrMatch.replace(/\s+(?:19|20)\d{2}\b/g, "");
  // Remove anything after common release group indicators or year-like numbers
  t = t.split(/\s+\[/)[0]; // Remove [GROUP] tags
  return t.trim();
}

function formatPath(item) {
  if (item.type === "tv") {
    const s = String(item.seasonNumber || 1).padStart(2, "0");
    const e = String(item.episodeNumber || 1).padStart(2, "0");
    const eEnd = item.episodeEnd
      ? `-E${String(item.episodeEnd).padStart(2, "0")}`
      : "";
    const epLabel = item.episodeTitle ? ` - ${item.episodeTitle}` : "";
    return `/TV Shows/${item.title}/Season ${s}/S${s}E${e}${eEnd}${epLabel}.mp4`;
  }
  if (item.type === "anime") {
    const s = String(item.seasonNumber || 1).padStart(2, "0");
    const e = String(item.episodeNumber || 1).padStart(3, "0");
    return `/Anime/${item.title}/Season ${s}/${item.title} - ${e}.mp4`;
  }
  return `/Movies/${item.genre || "Unsorted"}/${item.title}${item.year ? ` (${item.year})` : ""}/${item.cleanedFilename}`;
}

// ── Main parse function ────────────────────────────────────────────────

export function parseFilename(originalFilename) {
  // ── Pre-flight checks (before heavy stripping) ─────────────────────────
  // Look for episode patterns in original filename to determine type early
  const hasEpisodePattern = /[ES]\d{1,3}/i.test(originalFilename);
  const hasSeasonsEpisodes = /S\d{1,2}\s*E\d{1,3}/i.test(originalFilename);
  
  const hasMovieKW =
    /\b(?:the\.?movie|motion\.?picture|telesync|hdcam|screener|dvdscr|cam\.?rip)\b/i.test(
      originalFilename,
    );
  const isAnimeSource = /\b(?:crunchyroll|funimation|hidive|vrv|anidb)\b/i.test(
    originalFilename,
  );

  const cleaned = normalizeSpacing(stripAll(originalFilename));

  // ── 1. Multi-episode: S01E01E02, S01E01-E02, S01E01-03 ────────────────
  const multiEpPattern =
    /^(.+?)\s+S(\d{1,2})\s*E(\d{1,3})(?:[-–]?E)?(\d{1,3})\s*(?:-\s*)?(.*)$/i;
  const multiM = cleaned.match(multiEpPattern);
  if (multiM) {
    const titleRaw = extractTitleFromFilename(multiM[1]);
    const show = titleCase(titleRaw);
    const sn = parseInt(multiM[2]),
      en = parseInt(multiM[3]),
      enEnd = parseInt(multiM[4]);
    let epTitle = multiM[5] ? titleCase(multiM[5].trim()) : null;
    if (epTitle && epTitle.length < 2) epTitle = null;
    return {
      title: show,
      type: "tv",
      year: extractYear(multiM[1]),
      seasonNumber: sn,
      episodeNumber: en,
      episodeEnd: enEnd,
      episodeTitle: epTitle,
      confidence: 97,
      cleanedFilename: `${show} - S${String(sn).padStart(2, "0")}E${String(en).padStart(2, "0")}-E${String(enEnd).padStart(2, "0")}.mp4`,
      isMultiEpisode: true,
    };
  }

  // ── 2. Standard TV: S01E05, S1E5 ───────────────────────────────────────
  const tvStandard = /^(.+?)\s+S(\d{1,2})\s*E(\d{1,3})\s*(?:-\s*)?(.*)$/i;
  const tvM = cleaned.match(tvStandard);
  if (tvM) {
    const titleRaw = extractTitleFromFilename(tvM[1]);
    const show = titleCase(titleRaw);
    let epTitle = tvM[4] ? titleCase(tvM[4].trim()) : null;
    if (epTitle && (epTitle.length < 2 || /^[se]$/i.test(epTitle)))
      epTitle = null;
    const sn = parseInt(tvM[2]),
      en = parseInt(tvM[3]);
    return {
      title: show,
      type: isAnimeSource ? "anime" : "tv",
      year: extractYear(tvM[1]),
      seasonNumber: sn,
      episodeNumber: en,
      episodeEnd: null,
      episodeTitle: epTitle,
      confidence: 97,
      cleanedFilename: `${show} - S${String(sn).padStart(2, "0")}E${String(en).padStart(2, "0")}${epTitle ? ` - ${epTitle}` : ""}.mp4`,
      isMultiEpisode: false,
    };
  }

  // ── 3. 1x05 format ─────────────────────────────────────────────────────
  const altTvM = cleaned.match(
    /^(.+?)\s+(\d{1,2})x(\d{1,3})\s*(?:-\s*)?(.*)$/i,
  );
  if (altTvM) {
    const titleRaw = extractTitleFromFilename(altTvM[1]);
    const show = titleCase(titleRaw);
    const sn = parseInt(altTvM[2]),
      en = parseInt(altTvM[3]);
    let epTitle = altTvM[4] ? titleCase(altTvM[4].trim()) : null;
    if (epTitle && epTitle.length < 2) epTitle = null;
    return {
      title: show,
      type: "tv",
      year: extractYear(altTvM[1]),
      seasonNumber: sn,
      episodeNumber: en,
      episodeEnd: null,
      episodeTitle: epTitle,
      confidence: 93,
      cleanedFilename: `${show} - S${String(sn).padStart(2, "0")}E${String(en).padStart(2, "0")}.mp4`,
      isMultiEpisode: false,
    };
  }

  // ── 4. Season N Episode N ──────────────────────────────────────────────
  const longTvM = cleaned.match(
    /^(.+?)\s+Season\s*(\d{1,2})\s+Episode\s*(\d{1,3})\s*(?:-\s*)?(.*)$/i,
  );
  if (longTvM) {
    const titleRaw = extractTitleFromFilename(longTvM[1]);
    const show = titleCase(titleRaw);
    const sn = parseInt(longTvM[2]),
      en = parseInt(longTvM[3]);
    return {
      title: show,
      type: "tv",
      year: extractYear(longTvM[1]),
      seasonNumber: sn,
      episodeNumber: en,
      episodeEnd: null,
      episodeTitle: longTvM[4] ? titleCase(longTvM[4].trim()) : null,
      confidence: 95,
      cleanedFilename: `${show} - S${String(sn).padStart(2, "0")}E${String(en).padStart(2, "0")}.mp4`,
      isMultiEpisode: false,
    };
  }

  // ── 5. OVA / Special / Movie (in-series) ──────────────────────────────
  const ovaM = cleaned.match(
    /^(.+?)\s+(?:OVA|ONA|OAD|Special|Movie|Film)\s*(\d{0,3})\s*(?:-\s*)?(.*)$/i,
  );
  if (ovaM && !hasMovieKW) {
    const titleRaw = extractTitleFromFilename(ovaM[1]);
    const show = titleCase(titleRaw);
    const label =
      cleaned.match(/\b(OVA|ONA|OAD|Special|Movie)\b/i)?.[1]?.toUpperCase() ||
      "SPECIAL";
    return {
      title: show,
      type: "anime",
      year: null,
      seasonNumber: 0,
      episodeNumber: ovaM[2] ? parseInt(ovaM[2]) : 1,
      episodeEnd: null,
      episodeTitle: `${label}${ovaM[2] ? " " + ovaM[2] : ""}${ovaM[3] ? " - " + titleCase(ovaM[3]) : ""}`,
      confidence: 88,
      cleanedFilename: `${show} - ${label}${ovaM[2] ? ovaM[2].padStart(2, "0") : ""}.mp4`,
      isSpecial: true,
      isMultiEpisode: false,
    };
  }

  // ── 6. Anime with long ep numbers (One Piece 1050, Naruto 220) ─────────
  // IMPORTANT: Only match if NOT preceded by resolution context (like .360p)
  const animeHighEp = cleaned.match(/^(.+?)\s*[-–]\s*(\d{3,4})(?:\s|$)/);
  if (animeHighEp && !hasMovieKW) {
    const epNum = parseInt(animeHighEp[2]);
    // Exclude common resolutions: 240, 360, 480, 540, 720, 1080, 2160, 4320
    const commonResolutions = [240, 360, 480, 540, 720, 1080, 2160, 4320];
    const isRes = commonResolutions.includes(epNum);
    // Exclude years (1900-2099)
    const isYear = epNum >= 1900 && epNum <= 2099;
    if (!isRes && !isYear && epNum >= 100 && epNum <= 2000) {
      const titleRaw = extractTitleFromFilename(animeHighEp[1]);
      const { cleanTitle, season } = stripSeasonInTitle(titleCase(titleRaw));
      const show = cleanTitle;
      return {
        title: show,
        type: "anime",
        year: null,
        seasonNumber: season || 1,
        episodeNumber: epNum,
        episodeEnd: null,
        episodeTitle: null,
        confidence: 87,
        cleanedFilename: `${show} - ${String(epNum).padStart(3, "0")}.mp4`,
        isMultiEpisode: false,
      };
    }
  }

  // ── 7. Standard anime dash-episode: "Show - 05" ────────────────────────
  // Only match if we detected episode pattern in original filename
  const animeM = cleaned.match(/^(.+?)\s*[-–]\s*(\d{1,3})(?:\s*[-–]\s*(.+))?$/);
  if (animeM && !hasMovieKW && hasEpisodePattern) {
    const epNum = parseInt(animeM[2]);
    const commonResolutions = [240, 360, 480, 540, 720, 1080, 2160, 4320];
    const isRes = commonResolutions.includes(epNum);
    // Also exclude years (2019, 2020, etc.) — these look like "201", "202" when truncated
    const isLikelyYear = epNum >= 190 && epNum <= 225; // covers 1900-2259 when truncated to 3 digits
    if (!isRes && !isLikelyYear && epNum >= 1 && epNum < 500) {
      const titleRaw = extractTitleFromFilename(animeM[1]);
      const { cleanTitle, season } = stripSeasonInTitle(titleCase(titleRaw));
      const show = cleanTitle;
      const sn = season || 1;
      return {
        title: show,
        type: "anime",
        year: null,
        seasonNumber: sn,
        episodeNumber: epNum,
        episodeEnd: null,
        episodeTitle: animeM[3] ? titleCase(animeM[3].trim()) : null,
        confidence: 85,
        cleanedFilename: `${show} - ${String(epNum).padStart(2, "0")}.mp4`,
        isMultiEpisode: false,
      };
    }
  }

  // ── 8. Standalone two-digit episode: "Show 05" ─────────────────────────
  const standM = cleaned.match(/^(.+?)\s+(\d{2})$/);
  if (standM && !hasMovieKW) {
    const epNum = parseInt(standM[2]);
    if (epNum >= 1 && epNum <= 99) {
      const titleRaw = extractTitleFromFilename(standM[1]);
      const { cleanTitle, season } = stripSeasonInTitle(titleCase(titleRaw));
      const show = cleanTitle;
      return {
        title: show,
        type: "anime",
        year: null,
        seasonNumber: season || 1,
        episodeNumber: epNum,
        episodeEnd: null,
        episodeTitle: null,
        confidence: 78,
        cleanedFilename: `${show} - ${String(epNum).padStart(2, "0")}.mp4`,
        isMultiEpisode: false,
      };
    }
  }

  // ── 9. E## only ────────────────────────────────────────────────────────
  // This must run BEFORE movie detection to catch "Show E##" patterns
  const epOnlyM = cleaned.match(
    /^(.+?)\s*[-–]?\s*E(\d{1,3})(?:\s*[-–]\s*(.+))?$/i,
  );
  if (epOnlyM && !hasMovieKW) {
    const epNum = parseInt(epOnlyM[2]);
    if (epNum > 0 && epNum < 500) {
      const titleRaw = extractTitleFromFilename(epOnlyM[1]);
      const { cleanTitle, season } = stripSeasonInTitle(titleCase(titleRaw));
      const show = cleanTitle;
      const sn = season || 1;
      let epTitle = epOnlyM[3] ? titleCase(epOnlyM[3].trim()) : null;
      if (epTitle && epTitle.length < 2) epTitle = null;
      return {
        title: show,
        type: "tv",
        year: extractYear(epOnlyM[1]),
        seasonNumber: sn,
        episodeNumber: epNum,
        episodeEnd: null,
        episodeTitle: epTitle,
        confidence: 95,
        cleanedFilename: `${show} - S${String(sn).padStart(2, "0")}E${String(epNum).padStart(2, "0")}${epTitle ? ` - ${epTitle}` : ""}.mp4`,
        isMultiEpisode: false,
      };
    }
  }

  // ── 10. Part N (multi-part movie) ──────────────────────────────────────
  const partM = cleaned.match(
    /^(.+?)\s+(?:Part|Pt)\.?\s*(\d+|[IVX]+)\s*(?:[-–:]\s*(.+))?$/i,
  );
  if (partM && !partM[1].match(/S\d{1,2}$/i)) {
    const titleRaw = extractTitleFromFilename(partM[1]);
    const base = titleCase(titleRaw);
    const partNum = ROMAN[partM[2].toLowerCase()] || partM[2];
    const subtitle = partM[3] ? titleCase(partM[3].trim()) : null;
    const movieTitle = `${base} Part ${partNum}${subtitle ? ": " + subtitle : ""}`;
    return {
      title: movieTitle,
      type: "movie",
      year: extractYear(partM[1]),
      seasonNumber: null,
      episodeNumber: null,
      episodeEnd: null,
      episodeTitle: null,
      confidence: 82,
      cleanedFilename: `${movieTitle}.mp4`,
      isPart: true,
      isMultiEpisode: false,
    };
  }

  // ── 11. Movie with year ─────────────────────────────────────────────────
  const yearM = cleaned.match(
    /^(.+?)\s+[\(\[]?(19\d{2}|20[012]\d)[\)\]]?\s*(.*)$/,
  );
  if (yearM || hasMovieKW) {
    let mt = cleaned,
      year = null;
    if (yearM) {
      // Only treat as year pattern if title is reasonable length (not just a single word)
      const titleRaw = extractTitleFromFilename(yearM[1]);
      const titleWords = titleRaw.trim().split(/\s+/).length;
      
      // If title is just one word and looks like "The Movie 2019", skip this pattern
      // and let it fall through to other patterns
      if (titleWords > 1 || titleRaw.trim().length > 5) {
        mt = titleRaw.trim();
        year = parseInt(yearM[2]);
      } else {
        // Skip year pattern for short titles like "The", which are likely false matches
        // Allow patterns to continue to other matchers
        year = null;
      }
    }
    
    if (year || hasMovieKW) {
      mt = mt.replace(/\s*[-–]?\s*the\s*movie\s*/gi, " ").trim();
      mt = titleCase(mt);
      return {
        title: mt,
        type: "movie",
        year,
        seasonNumber: null,
        episodeNumber: null,
        episodeEnd: null,
        episodeTitle: null,
        confidence: hasMovieKW ? 95 : 86,
        cleanedFilename: year ? `${mt} (${year}).mp4` : `${mt}.mp4`,
        isMultiEpisode: false,
      };
    }
  }

  // ── 12. Final check: detect episodes in original filename if missed ─────
  // This catches cases where aggressive stripping missed episode patterns
  // Handle dots, dashes, and spaces as separators in the original filename
  if (hasEpisodePattern && !hasMovieKW) {
    // Normalize separators to spaces for matching, but preserve original for title extraction
    const normalizedForMatch = originalFilename.replace(/[\.\-_\s]+/g, " ");
    
    // First try S##E## pattern  
    const origSEPattern = /^(.+?)\s+S(\d{1,2})\s*E(\d{1,3})/i;
    const origSEMatch = normalizedForMatch.match(origSEPattern);
    if (origSEMatch) {
      const titleRaw = extractTitleFromFilename(origSEMatch[1]);
      const title = titleCase(titleRaw);
      const sn = parseInt(origSEMatch[2]);
      const epNum = parseInt(origSEMatch[3]);
      if (epNum > 0 && epNum < 500 && sn > 0 && sn < 100 && title.length > 1) {
        return {
          title,
          type: isAnimeSource ? "anime" : "tv",
          year: extractYear(originalFilename),
          seasonNumber: sn,
          episodeNumber: epNum,
          episodeEnd: null,
          episodeTitle: null,
          confidence: 94,
          cleanedFilename: `${title} - S${String(sn).padStart(2, "0")}E${String(epNum).padStart(2, "0")}.mp4`,
          isMultiEpisode: false,
        };
      }
    }
    
    // Then try E## only pattern from original filename
    // This handles: "Show E11", "Show.E11", "Show - E11"
    const origEpPattern = /^(.+?)\s+E(\d{1,3})/i;
    const origMatch = normalizedForMatch.match(origEpPattern);
    if (origMatch) {
      const titleRaw = extractTitleFromFilename(origMatch[1]);
      const titleCased = titleCase(titleRaw);
      const epNum = parseInt(origMatch[2]);
      if (epNum > 0 && epNum < 500 && titleCased.length > 1) {
        const { cleanTitle, season } = stripSeasonInTitle(titleCased);
        return {
          title: cleanTitle,
          type: isAnimeSource ? "anime" : "tv",
          year: extractYear(originalFilename),
          seasonNumber: season || 1,
          episodeNumber: epNum,
          episodeEnd: null,
          episodeTitle: null,
          confidence: 92,
          cleanedFilename: `${cleanTitle} - S${String(season || 1).padStart(2, "0")}E${String(epNum).padStart(2, "0")}.mp4`,
          isMultiEpisode: false,
        };
      }
    }
  }

  // ── 13. Fallback: treat as movie ───────────────────────────────────────
  const ft = titleCase(cleaned);
  if (ft.length > 2 && ft.length < 120) {
    return {
      title: ft,
      type: "movie",
      year: null,
      seasonNumber: null,
      episodeNumber: null,
      episodeEnd: null,
      episodeTitle: null,
      confidence: 38,
      cleanedFilename: `${ft}.mp4`,
      isMultiEpisode: false,
    };
  }

  return {
    title: originalFilename,
    type: "unknown",
    year: null,
    seasonNumber: null,
    episodeNumber: null,
    episodeEnd: null,
    episodeTitle: null,
    confidence: 0,
    cleanedFilename: originalFilename,
    isMultiEpisode: false,
  };
}

// ── Duration filter ────────────────────────────────────────────────────
export const MIN_DURATION_SECONDS = 8 * 60; // 8 minutes

export function checkDuration(durationSeconds) {
  if (durationSeconds === null || durationSeconds === undefined)
    return { ok: true, reason: null };
  if (durationSeconds < MIN_DURATION_SECONDS) {
    const mins = Math.round(durationSeconds / 60);
    return {
      ok: false,
      reason: `Too short (${mins} min) — FilmSort only indexes videos ≥8 min`,
    };
  }
  return { ok: true, reason: null };
}

export function getSuggestedPath(item) {
  return formatPath(item);
}
