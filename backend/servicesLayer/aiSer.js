const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite';

// try the main model; if Google is busy (503 etc.), try the lighter model once
async function generate(contents, config) {
    try {
        return await ai.models.generateContent({ model: MODEL, contents, config });
    } catch (err) {
        return await ai.models.generateContent({ model: FALLBACK_MODEL, contents, config });
    }
}
const EMBED_MODEL = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';

/**
 * Ask Gemini, get plain text back.
 * @param {string} rules - how the AI must behave (system instruction)
 * @param {string} prompt - the question plus any data we give it
 */
async function askText(rules, prompt) {
    const res = await generate(prompt, { systemInstruction: rules });
    return res.text;
}

/**
 * Ask Gemini, get a JSON object back (structured generation).
 * @param {string} rules - how the AI must behave
 * @param {string} prompt - the question
 */
async function askJson(rules, prompt) {
    const res = await generate(prompt, { systemInstruction: rules, responseMimeType: 'application/json' });
    return JSON.parse(res.text);
}

/**
 * Turn text into an embedding (array of numbers) for RAG search.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function embed(text) {
    const res = await ai.models.embedContent({
        model: EMBED_MODEL,
        contents: text,
    });
    return res.embeddings[0].values;
}

module.exports = { askText, askJson, embed };