#!/usr/bin/env node
// Test parser with sample filenames

import { parseFilename } from './src/utils/parser.js';

// Test cases for Absolute Duo and other problematic shows
const testCases = [
  // Absolute Duo - these should parse correctly
  { input: 'Absolute Duo - 01.mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 1 },
  { input: 'Absolute Duo - 02.mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 2 },
  { input: 'Absolute Duo - 13.mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 13 },
  { input: 'Absolute.Duo.S01E01.720p.mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 1 },
  { input: 'Absolute Duo 1080p 01.mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 1 },
  { input: '[HorribleSubs] Absolute Duo - 01 [720p].mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 1 },
  { input: '[HorribleSubs] Absolute Duo - 02 [720p].mkv', expectedType: 'anime', expectedSeason: 1, expectedEp: 2 },
  
  // Multi-episode formats
  { input: 'Show Name S01E01E02.mkv', expectedType: 'tv', expectedSeason: 1, expectedEp: 1, expectedEpEnd: 2 },
  { input: 'Show Name S02E01-E03.mkv', expectedType: 'tv', expectedSeason: 2, expectedEp: 1, expectedEpEnd: 3 },
  
  // Movies with years
  { input: 'Movie Title (2020).mkv', expectedType: 'movie' },
  { input: 'The Movie 2019.mkv', expectedType: 'movie' },
  
  // Part movies
  { input: 'Dune Part One.mkv', expectedType: 'movie' },
  { input: 'Dune Part II.mkv', expectedType: 'movie' },
  
  // Anime with high episode numbers
  { input: 'One Piece - 1050.mkv', expectedType: 'anime', expectedEp: 1050 },
  { input: 'Naruto - 220.mkv', expectedType: 'anime', expectedEp: 220 },
  
  // E## only format
  { input: 'Show Name E05.mkv', expectedType: 'tv', expectedEp: 5 },
  { input: 'Show Name - E11.mkv', expectedType: 'tv', expectedEp: 11 },
];

let passed = 0;
let failed = 0;

console.log('Testing parser with various filenames:\n');
console.log('═'.repeat(80));

testCases.forEach(({ input, expectedType, expectedSeason, expectedEp, expectedEpEnd }) => {
  const result = parseFilename(input);
  
  let isPass = true;
  const failures = [];
  
  if (result.type !== expectedType) {
    isPass = false;
    failures.push(`Type: expected "${expectedType}", got "${result.type}"`);
  }
  
  if (expectedSeason !== undefined && result.seasonNumber !== expectedSeason) {
    isPass = false;
    failures.push(`Season: expected ${expectedSeason}, got ${result.seasonNumber}`);
  }
  
  if (expectedEp !== undefined && result.episodeNumber !== expectedEp) {
    isPass = false;
    failures.push(`Episode: expected ${expectedEp}, got ${result.episodeNumber}`);
  }
  
  if (expectedEpEnd !== undefined && result.episodeEnd !== expectedEpEnd) {
    isPass = false;
    failures.push(`Episode End: expected ${expectedEpEnd}, got ${result.episodeEnd}`);
  }
  
  const status = isPass ? '✓ PASS' : '✗ FAIL';
  console.log(`${status} ${input}`);
  console.log(`     Title: "${result.title}" | Type: ${result.type} | Confidence: ${result.confidence}%`);
  
  if (result.type === 'tv' || result.type === 'anime') {
    console.log(`     Season ${result.seasonNumber}, Episode ${result.episodeNumber}${result.episodeEnd ? `-${result.episodeEnd}` : ''}`);
  }
  if (result.year) console.log(`     Year: ${result.year}`);
  
  if (!isPass) {
    console.log(`     ⚠ Issues: ${failures.join('; ')}`);
  }
  
  console.log();
  
  if (isPass) passed++;
  else failed++;
});

console.log('═'.repeat(80));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed > 0) {
  process.exit(1);
}
