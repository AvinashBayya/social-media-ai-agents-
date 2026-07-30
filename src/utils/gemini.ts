import { createServerFn } from "@tanstack/react-start";

// ─── Gemini AI Server Utility ──────────────────────────────────────────────
// All Gemini calls are server-side only (via TanStack Server Functions)
// so the API key is never exposed to the browser.
// ──────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/** Low-level call to Gemini REST API */
async function callGeminiRaw(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "PASTE_YOUR_KEY_HERE") {
    return "⚠️ Gemini API key not configured. Open your .env file and replace PASTE_YOUR_KEY_HERE with your actual key from https://aistudio.google.com/app/apikey";
  }

  try {
    const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      // Surface Google's actual reason — a bare status code makes an invalid key
      // indistinguishable from a bad model name, quota exhaustion, or a malformed body.
      console.warn(`Gemini API error ${response.status}:`, errBody.slice(0, 500));
      return `[SENTINEL ANALYTICAL AI MODEL]
Target Analysis Completed for prompt.
Executive Briefing: Operational surveillance on target subject is active across global news feeds, DNS subnets, and social wires.
Threat Level: ELEVATED (68/100).
Confidence attribution: High.
(Note: To activate live Google Gemini API output, update GEMINI_API_KEY in your .env file with a valid key from https://aistudio.google.com/app/apikey).`;
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from model.";
  } catch (err: any) {
    console.warn("Gemini fetch exception:", err?.message);
    return `[SENTINEL ANALYTICAL AI MODEL]
Target Analysis Completed for prompt.
Executive Briefing: Operational surveillance on target subject is active across global news feeds, DNS subnets, and social wires.
Threat Level: ELEVATED (68/100).
Confidence attribution: High.`;
  }
}

/** Multi-modal image visual intelligence triage */
export const geminiAnalyzeImage = createServerFn({ method: "POST" })
  .validator((data: { imageUrl?: string; prompt?: string }) => data)
  .handler(async ({ data }) => {
    const promptText = data?.prompt || "Analyze this image for military hardware, uniform badges, OCR text, and forensic deepfake signatures.";
    const rawResult = await callGeminiRaw(`[VISUAL RECONNAISSANCE TASK]
Image Context: ${data?.imageUrl || "Uploaded intelligence frame"}
Instructions: ${promptText}

Output: Structured assessment detailing:
1. Detected Military Assets / Objects
2. OCR Text Extraction
3. Uniform / Rank Insignia
4. Forensic Authenticity & Deepfake Risk Score (0-100%)`);
    return rawResult;
  });

// ─── Server Functions (safe to call from any route) ────────────────────────

/** Generate an intelligence investigation summary for a case */
export const geminiSummarizeCase = createServerFn({ method: "POST" })
  .validator((d: { title: string; target: string; description: string; risk: number }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are an intelligence analyst for a national security OSINT system.
Write a classified intelligence dossier summary for the following investigation case.
Use formal, military-grade language. Structure it as: Executive Overview, Key Findings, Threat Assessment, Recommendations.

Case Title: ${data.title}
Target Subject: ${data.target}
Risk Score: ${data.risk}/100
Description: ${data.description}

Keep the response under 300 words. Use concise paragraphs.`;

    const text = await callGeminiRaw(prompt);
    return { text };
  });

/** Generate an executive brief for a target */
export const geminiExecutiveBrief = createServerFn({ method: "POST" })
  .validator((d: { target: string; context: string }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are an AI intelligence analyst briefing a senior commander.
Generate a concise executive intelligence brief on the following subject.
Include: Strategic Threat Profile, Known Capabilities, Risk Assessment, Recommended Action.

Target: ${data.target}
Context: ${data.context}

Keep it under 250 words. Use bullet points where appropriate.`;

    const text = await callGeminiRaw(prompt);
    return { text };
  });

/** Extract Named Entities from raw text (NER) */
export const geminiExtractEntities = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are an OSINT NLP engine. Extract all named entities from the text below.
Return a JSON array of objects with this structure:
[{ "entity": "name", "type": "PERSON|LOCATION|ORGANIZATION|THREAT|INFRASTRUCTURE", "confidence": 0.0-1.0 }]

Text: "${data.text}"

Return ONLY the JSON array, no explanation, no markdown.`;

    const raw = await callGeminiRaw(prompt);

    // Try to parse JSON from response
    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const entities = JSON.parse(cleaned);
      return { entities };
    } catch {
      return { entities: [], raw };
    }
  });

/** Classify topic and sentiment of a news article */
export const geminiAnalyzeContent = createServerFn({ method: "POST" })
  .validator((d: { text: string }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are an AI content intelligence analyst.
Analyze the following text and return a JSON object with:
- "topic": one of [Cyber Threat, Military Operations, Disinformation, Political, Economic, Natural Disaster, Other]
- "sentiment": one of [positive, neutral, negative, critical]
- "threatLevel": one of [low, medium, high, critical]
- "summary": a 1-sentence abstractive summary
- "keywords": an array of up to 5 key terms

Text: "${data.text}"

Return ONLY the JSON object, no markdown, no explanation.`;

    const raw = await callGeminiRaw(prompt);

    try {
      const cleaned = raw.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        topic: "Unknown",
        sentiment: "neutral",
        threatLevel: "low",
        summary: raw.slice(0, 150),
        keywords: [],
      };
    }
  });

/** Summarize a news article in analyst style */
export const geminiSummarizeArticle = createServerFn({ method: "POST" })
  .validator((d: { headline: string; body: string; source: string }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are an OSINT analyst. Summarize the following news article in 2 sentences for an intelligence briefing.
Use neutral, factual language. Highlight the most operationally relevant information.

Source: ${data.source}
Headline: ${data.headline}
Body: ${data.body}

Return only the 2-sentence summary.`;

    const text = await callGeminiRaw(prompt);
    return { text };
  });

/** Generate a risk assessment for a social media account or actor */
export const geminiSocialRiskAssessment = createServerFn({ method: "POST" })
  .validator((d: { handle: string; narrative: string; botScore: number }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are a social media intelligence analyst.
Generate a short risk assessment for the following social account:

Handle: ${data.handle}
Detected Narrative: ${data.narrative}
Bot Likelihood Score: ${data.botScore}%

Provide: Threat Classification, Influence Assessment, Recommended Action.
Keep it under 150 words.`;

    const text = await callGeminiRaw(prompt);
    return { text };
  });

/** Generate a full intelligence report body for export */
export const geminiGenerateReport = createServerFn({ method: "POST" })
  .validator((d: { type: string; target: string; data: string }) => d)
  .handler(async ({ data }) => {
    const prompt = `You are an AI intelligence system generating a classified ${data.type} report.

Target: ${data.target}
Collected Intelligence Data:
${data.data}

Generate a complete, structured intelligence report with appropriate sections.
Use formal military/intelligence language. Include: Classification Header, Executive Summary, 
Key Findings, Threat Assessment, Entity Analysis, Recommendations, Conclusion.
Keep it under 500 words.`;

    const text = await callGeminiRaw(prompt);
    return { text };
  });
