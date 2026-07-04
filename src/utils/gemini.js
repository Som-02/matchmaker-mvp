// Gemini API integration.
//
// The API key is read from an environment variable so it never lives in source
// control or gets shared in chat. Set VITE_GEMINI_API_KEY in a local .env file
// (see .env.example) and, for the deployed version, in your Vercel/Netlify
// project's Environment Variables settings.
//
// If no key is configured, the app falls back to a deterministic, rule-based
// explanation generator so the dashboard still works end-to-end for a demo
// or offline review.

const GEMINI_MODEL = "gemini-2.0-flash";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function fallbackExplanation(customer, match) {
  const label = match.matchScore >= 80 ? "High Potential Match" : match.matchScore >= 65 ? "Good Match" : "Worth Exploring";
  const reasonText = match.matchReasons.slice(0, 2).join(" and ").toLowerCase();
  return `${label}: ${customer.firstName} and ${match.firstName} align well on ${reasonText || "several key preferences"}.`;
}

function fallbackIntro(customer, match) {
  return `Hi ${customer.firstName}, we found someone we think you'll like — ${match.firstName}, a ${match.age}-year-old ${match.designation} from ${match.city}. ${match.aboutMe} We thought this could be a great match based on your shared interests and values.`;
}

async function callGemini(prompt) {
  if (!API_KEY) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch (err) {
    console.error("Gemini call failed, using fallback:", err);
    return null;
  }
}

// Generates a short, human-readable explanation of why two profiles were matched.
export async function generateMatchExplanation(customer, match) {
  const prompt = `You are an experienced matchmaker writing a short, warm, one-sentence
explanation (max 30 words) of why these two people could be a good match. Be specific,
reference at least one real shared trait, and label the match as one of:
"High Potential Match", "Good Match", or "Worth Exploring" based on this compatibility
score out of 100: ${match.matchScore}.

Customer: ${customer.firstName}, ${customer.age}, ${customer.designation} in ${customer.city}.
Values: ${customer.valueTags.join(", ")}. Wants kids: ${customer.wantKids}.

Candidate: ${match.firstName}, ${match.age}, ${match.designation} in ${match.city}.
Values: ${match.valueTags.join(", ")}. Wants kids: ${match.wantKids}.

Existing rule-based signals: ${match.matchReasons.join("; ")}.

Respond with only the one-sentence explanation, nothing else.`;

  const result = await callGemini(prompt);
  return result || fallbackExplanation(customer, match);
}

// Generates a short, personalized "intro" message used in the mock Send Match email.
export async function generatePersonalizedIntro(customer, match) {
  const prompt = `Write a short, warm, personalized message (2-3 sentences, max 60 words)
from a matchmaker to their client, introducing a new potential match. Use the client's
first name, mention the match's first name, one detail about the match (profession or
city or a value they share), and end on an encouraging note. No greetings like "Dear",
keep it conversational.

Client: ${customer.firstName}.
Match: ${match.firstName}, ${match.age}, ${match.designation} in ${match.city}.
About the match: ${match.aboutMe}
Shared values: ${match.matchReasons.join("; ")}

Respond with only the message text.`;

  const result = await callGemini(prompt);
  return result || fallbackIntro(customer, match);
}

export const isGeminiConfigured = Boolean(API_KEY);
