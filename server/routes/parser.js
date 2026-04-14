import express from "express";
import axios from "axios";
import https from "https";
import http from "http";

const router = express.Router();

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
// Support both VITE_NVIDIA_API_KEY (client convention) and NVIDIA_API_KEY (server convention)
const NVIDIA_API_KEY = process.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY;
const MODEL = "google/gemma-4-31b-it";
const AI_TIMEOUT_MS = 120000; // 120 seconds for external AI API (increased from 60s)
const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2000; // Initial delay increased to 2s, exponential backoff

// Create axios instance with connection pooling and timeout
const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 5 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 5 }),
  timeout: AI_TIMEOUT_MS,
});

console.log("[Parser Routes] NVIDIA API Key loaded:", NVIDIA_API_KEY ? "✓ Present" : "✗ Missing");

/**
 * POST /api/parser/ai-parse
 * Parse a filename using NVIDIA AI
 */
router.post("/ai-parse", async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: "filename is required" });
    }

    if (!NVIDIA_API_KEY) {
      console.error("[Parser API] NVIDIA_API_KEY not found in environment");
      return res
        .status(500)
        .json({ error: "VITE_NVIDIA_API_KEY not configured on server" });
    }

    const aiResponse = await queryNvidiaAI(filename);
    const parsed = parseAIResponse(aiResponse, filename);

    res.json(parsed);
  } catch (error) {
    console.error("[Parser API] Error:", error.message);
    console.error("[Parser API] Full error:", error);
    res.status(500).json({
      error: error.message || "AI parsing failed",
    });
  }
});

/**
 * Query NVIDIA Gemma API for filename analysis with retry logic
 */
async function queryNvidiaAI(filename, retryCount = 0) {
  const prompt = `Analyze this media filename and extract:
1. Show/Movie title (cleaned)
2. Type: 'movie', 'tv', or 'anime'
3. Season number (if TV/anime)
4. Episode number(s) (if TV/anime)
5. Year (if present)
6. Episode title (if present)

Filename: ${filename}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "title": "string",
  "type": "movie|tv|anime",
  "seasonNumber": number|null,
  "episodeNumber": number|null,
  "episodeEnd": number|null,
  "year": number|null,
  "episodeTitle": string|null
}`;

  const payload = {
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.3,
    top_p: 0.9,
  };

  try {
    console.log(`[queryNvidiaAI] Attempt ${retryCount + 1}/${MAX_RETRIES} - Calling NVIDIA API...`);
    
    const response = await axiosInstance.post(NVIDIA_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: AI_TIMEOUT_MS,
    });

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response format");
    }

    console.log("[queryNvidiaAI] ✓ Success");
    return response.data.choices[0].message.content;
  } catch (error) {
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    const isRetryable = isTimeout || error.response?.status >= 500;

    console.error("[queryNvidiaAI] Error calling NVIDIA API:", {
      attempt: retryCount + 1,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      isRetryable,
    });

    // Retry with exponential backoff
    if (isRetryable && retryCount < MAX_RETRIES - 1) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`[queryNvidiaAI] Retrying in ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return queryNvidiaAI(filename, retryCount + 1);
    }

    // Final error message
    if (isTimeout) {
      throw new Error(`AI parser timeout after ${MAX_RETRIES} attempts (>${AI_TIMEOUT_MS}ms each)`);
    }
    throw error;
  }
}

/**
 * Parse AI response and return standardized object
 */
function parseAIResponse(aiResponse, originalFilename) {
  try {
    let jsonStr = aiResponse.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7, -3).trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3, -3).trim();
    }

    const parsed = JSON.parse(jsonStr);

    const title = (parsed.title || originalFilename).trim();
    const type = validateType(parsed.type || "movie");
    const seasonNumber =
      parsed.seasonNumber || (type === "tv" || type === "anime" ? 1 : null);
    const episodeNumber = parsed.episodeNumber || null;
    const episodeEnd = parsed.episodeEnd || null;
    const year = parsed.year || null;
    const episodeTitle = parsed.episodeTitle || null;

    // Generate cleaned filename
    let cleanedFilename = title;
    if (type === "tv") {
      const s = String(seasonNumber || 1).padStart(2, "0");
      const e = String(episodeNumber || 1).padStart(2, "0");
      const eEnd = episodeEnd ? `-E${String(episodeEnd).padStart(2, "0")}` : "";
      cleanedFilename = `${title} - S${s}E${e}${eEnd}${
        episodeTitle ? ` - ${episodeTitle}` : ""
      }.mp4`;
    } else if (type === "anime") {
      const s = String(seasonNumber || 1).padStart(2, "0");
      const e = String(episodeNumber || 1).padStart(3, "0");
      cleanedFilename = `${title} - ${e}.mp4`;
    } else {
      cleanedFilename = year ? `${title} (${year}).mp4` : `${title}.mp4`;
    }

    return {
      title,
      type,
      year,
      seasonNumber,
      episodeNumber,
      episodeEnd,
      episodeTitle,
      confidence: 92,
      cleanedFilename,
      isAIParsed: true,
    };
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

/**
 * Validate and normalize type field
 */
function validateType(type) {
  const normalized = type?.toLowerCase().trim();
  if (["movie", "tv", "anime"].includes(normalized)) {
    return normalized;
  }
  return "movie";
}

export default router;
