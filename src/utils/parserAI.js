import axios from 'axios';

/**
 * Parse filename using NVIDIA AI (via backend proxy)
 * Returns same structure as regex parser for compatibility
 */
export async function parseFilenameAI(filename) {
  try {
    const response = await axios.post('/api/parser/ai-parse', { filename });
    return response.data;
  } catch (error) {
    console.error(`[Parser] AI parsing failed for "${filename}":`, error.message);
    throw error;
  }
}

/**
 * Hybrid mode: Try fast regex parser first, use AI for low-confidence matches
 * This is the recommended approach for best performance
 */
export async function parseFilenameHybrid(filename, regexParser) {
  // First try regex parser (instant)
  const regexResult = regexParser(filename);

  // If regex parser is confident (>80%), use it
  if (regexResult.confidence > 80) {
    return regexResult;
  }

  // Low confidence: try AI parser for improvement
  try {
    const aiResult = await parseFilenameAI(filename);
    return {
      ...aiResult,
      regexFallback: regexResult,
      enhancedByAI: true,
    };
  } catch (error) {
    console.warn(`[Parser] AI enhancement failed, using regex result: ${error.message}`);
    return regexResult;
  }
}
