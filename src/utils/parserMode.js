// ═══════════════════════════════════════════════════════════════════════
//  FilmSort Parser Mode Selector
//  Switch between regex, AI, or hybrid parsing without changing app code
// ═══════════════════════════════════════════════════════════════════════

import { parseFilename as parseFilenameRegex } from './parser.js';
import { parseFilenameAI, parseFilenameHybrid } from './parserAI.js';

// Control which parser to use
export const PARSER_MODE = import.meta.env.VITE_PARSER_MODE || 'ai'; // 'regex' | 'ai' | 'hybrid'

/**
 * Universal parse function - automatically selects based on PARSER_MODE
 * Call this everywhere instead of parseFilename directly
 */
export async function parseFilename(filename) {
  switch (PARSER_MODE.toLowerCase()) {
    case 'ai':
      return parseFilenameAI(filename);

    case 'hybrid':
      return parseFilenameHybrid(filename, parseFilenameRegex);

    case 'regex':
    default:
      // Regex parser is synchronous, wrap in Promise for consistency
      return Promise.resolve(parseFilenameRegex(filename));
  }
}

/**
 * Alternative: Synchronous version for regex mode only
 * Use this if you need synchronous parsing and are in regex mode
 */
export function parseFilenameSync(filename) {
  if (PARSER_MODE !== 'regex') {
    throw new Error(
      'parseFilenameSync is only available in regex mode. Use parseFilename() instead.'
    );
  }
  return parseFilenameRegex(filename);
}

/**
 * Get current parser mode info
 */
export function getParserInfo() {
  return {
    mode: PARSER_MODE,
    description: {
      regex: 'Fast regex parser (instant, free, no API calls)',
      ai: 'NVIDIA Gemma AI parser (slower, costs money, very accurate)',
      hybrid: 'Regex first, AI for low-confidence matches (balanced)',
    }[PARSER_MODE] || 'Unknown',
  };
}
