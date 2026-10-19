const aiSer = require('./aiSer');
const knowledgeDat = require('../dataLayer/knowledgeDat');
const deliveriesDat = require('../dataLayer/deliveriesDat');

/**
 * Cosine similarity: how alike two embeddings are (1 = same meaning).
 * dot product ÷ (length of a × length of b)
 */
function cosine(a, b) {
    let dot = 0, lenA = 0, lenB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        lenA += a[i] * a[i];
        lenB += b[i] * b[i];
    }
    return dot / (Math.sqrt(lenA) * Math.sqrt(lenB));
}

// Business rule (RAG retrieve): the 3 help texts closest in meaning to the question
async function findClosest(question, count = 3) {
    const qVector = await aiSer.embed(question);
    const chunks = await knowledgeDat.getAllChunks();

    return chunks
        .map((c) => ({ title: c.title, content: c.content, score: cosine(qVector, c.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

const RULES = `You are "Ask Swift", the helper of Swift-Courier, a courier company in Singapore.
Answer ONLY from the HELP TEXTS and MY DELIVERIES given to you.
If the answer is not there, say you are not sure and suggest contacting Swift-Courier support.
Never invent prices: for an exact price, tell the customer to use the Book page.
Keep answers short (max 4 sentences), friendly and simple.Reply in plain text only, no markdown, no ** or bullet symbols.;`


/**
 * Business rules: customer asks Ask Swift (RAG)
 * 1. Retrieve: 3 closest help texts + the customer's own latest 10 deliveries (live data)
 * 2. Augment: put both into the prompt
 * 3. Generate: Gemini answers only from that data
 */
async function ask(customerId, question) {
    if (!question || !question.trim()) throw new Error('Please type a question');
    if (question.length > 300) throw new Error('Question is too long (max 300 characters)');

    const texts = await findClosest(question);
    const deliveries = (await deliveriesDat.getDeliveriesByCustomer(customerId)).slice(0, 10);

    const helpPart = texts.map((t) => `- ${t.title}: ${t.content}`).join('\n');
    const myPart = deliveries.length
        ? deliveries.map((d) => `- ${d.tracking_no}: ${d.status}, ${d.pickup_zone} to ${d.dropoff_zone}, ${d.vehicle}, $${d.total_fee}, ${d.payment_method} ${d.payment_status}`).join('\n')
        : 'No deliveries yet.';

    const prompt = `HELP TEXTS:\n${helpPart}\n\nMY DELIVERIES:\n${myPart}\n\nQUESTION: ${question}`;

    const answer = await aiSer.askText(RULES, prompt);
    return { answer, sources: texts.map((t) => t.title) };
}

module.exports = { findClosest, ask };