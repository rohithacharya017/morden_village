// ==========================================================================
// MODERN VILLAGE - AI PRIORITY CLASSIFICATION SERVICE
// Contextual Heuristics with Gemini AI API Integration & Rule-Based Fallback
// ==========================================================================

export { validateProblemReport } from './aiProblemValidator.js';

/**
 * Classifies a civic complaint based on Category, Title, Description, and context.
 * Returns { priority: 'HIGH' | 'MEDIUM' | 'LOW', reason: string, source: string }
 */
export async function classifyComplaintPriority({ category, title, description }) {
  const combinedText = `${title || ''} ${description || ''}`.toLowerCase();

  // 1. Try Gemini API if key is configured
  const geminiKey = (typeof import.meta !== 'undefined' && import.meta?.env)
    ? import.meta.env.VITE_GEMINI_API_KEY
    : (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY : null);
  if (geminiKey && geminiKey.trim() !== '') {
    try {
      const aiResult = await callGeminiClassifier(category, title, description, geminiKey);
      if (aiResult && ['HIGH', 'MEDIUM', 'LOW'].includes(aiResult.priority)) {
        return {
          priority: aiResult.priority,
          reason: aiResult.reason,
          source: 'Gemini AI Analysis'
        };
      }
    } catch (err) {
      console.warn('Gemini API classification failed, using rule-based fallback:', err);
    }
  }

  // 2. Rule-Based Fallback Classifier with In-Depth Contextual Heuristics
  return evaluateRuleBasedPriority(category, combinedText);
}

/**
 * Evaluates contextual severity rules grounded in civic safety standards
 */
function evaluateRuleBasedPriority(category, text) {
  // --- HIGH PRIORITY DETECTION ---
  // Immediate safety threats, electrical electrocution risk, water contamination, structural collapse, open deep drains
  const highSafetyKeywords = [
    'exposed wire', 'open wire', 'sparking', 'electric shock', 'electrocution', 'fallen pole', 'live wire',
    'contaminated water', 'poison', 'foul smell', 'epidemic', 'fever outbreak', 'yellow water', 'stinking water',
    'road collapsed', 'huge cave in', 'fatal', 'accident', 'deep trench', 'landslide', 'electric pole down',
    'open manhole', 'child fell', 'toxic sewage', 'overflowing sewage into homes',
    'roof collapsed', 'wall collapse', 'structural crack', 'building about to fall', 'broken glass',
    'rabid dog', 'snake bite', 'dangerous dog biting', 'dead animal', 'wild Animal'
  ];

  for (const phrase of highSafetyKeywords) {
    if (text.includes(phrase)) {
      return {
        priority: 'HIGH',
        reason: `Immediate safety or health hazard detected ("${phrase}"). Requires priority intervention within 24 hours.`,
        source: 'Contextual Safety Rules'
      };
    }
  }

  // Specific high category combinations
  if (category === 'Electrical Problems' && (text.includes('spark') || text.includes('fire') || text.includes('smoke') || text.includes('transformer'))) {
    return {
      priority: 'HIGH',
      reason: 'Electrical equipment sparking or overheating creates an imminent fire hazard in public vicinity.',
      source: 'Contextual Safety Rules'
    };
  }

  if (category === 'Water Supply' && (text.includes('dirty') || text.includes('sick') || text.includes('smell') || text.includes('muddy'))) {
    return {
      priority: 'HIGH',
      reason: 'Suspected water contamination poses direct gastrointestinal health risks to residents.',
      source: 'Contextual Safety Rules'
    };
  }

  // --- LOW PRIORITY DETECTION ---
  // Purely cosmetic, minor aesthetic, general cleanliness, non-disruptive requests
  const lowKeywords = [
    'paint', 'cosmetic', 'faded', 'color', 'colour', 'faded wall', 'wall paint', 'bench paint', 'playground swing squeak',
    'beautification', 'tree pruning', 'gardening', 'flower bed', 'dustbin lid missing',
    'small weed', 'minor scrape', 'graffiti', 'suggestion', 'signboard tilted'
  ];

  for (const phrase of lowKeywords) {
    if (text.includes(phrase) && !text.includes('danger') && !text.includes('urgent')) {
      return {
        priority: 'LOW',
        reason: `Routine maintenance or aesthetic enhancement ("${phrase}"). No direct hazard to public mobility or health.`,
        source: 'Contextual Safety Rules'
      };
    }
  }

  // --- MEDIUM PRIORITY (DEFAULT FOR STANDARD FUNCTIONAL COMPLAINTS) ---
  // Routine outages, streetlight dark, water pipeline leak, garbage accumulation, standard potholes
  let mediumReason = 'Public infrastructure disruption affecting daily community convenience.';

  if (category === 'Streetlights and Public Lighting' || text.includes('streetlight') || text.includes('dark')) {
    mediumReason = 'Non-working streetlight increases nocturnal navigation difficulty and security concern.';
  } else if (category === 'Water Supply' || text.includes('leak') || text.includes('pipeline')) {
    mediumReason = 'Pipeline leakage or water disruption requires repair to prevent wastage and resident inconvenience.';
  } else if (category === 'Waste Management and Sanitation' || text.includes('garbage') || text.includes('bin')) {
    mediumReason = 'Accumulated municipal waste requires clearance to prevent pest infestation and odor.';
  } else if (category === 'Roads and Transportation' || text.includes('pothole')) {
    mediumReason = 'Potholes or road surface wear requires civil patching to restore smooth transit.';
  } else if (category === 'Public Property Damage' || text.includes('wall') || text.includes('paint') || text.includes('building')) {
    mediumReason = 'Public building or community facility maintenance required to preserve village infrastructure.';
  }

  return {
    priority: 'MEDIUM',
    reason: mediumReason,
    source: 'Contextual Safety Rules'
  };
}

/**
 * Direct Gemini API Caller
 */
async function callGeminiClassifier(category, title, description, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an AI Triage Assistant for a rural Gram Panchayat civic administration portal.
Analyze the following civic complaint and assign exactly one priority level: HIGH, MEDIUM, or LOW.

Guidelines:
- HIGH: Imminent physical danger, electrocution risk (open/sparking wires), water contamination, major road cave-ins, structural collapse threats, sewage flooding homes.
- MEDIUM: Standard infrastructure outage affecting public use (streetlights out, water supply interrupted, potholes, overflowing garbage).
- LOW: Non-hazardous maintenance, minor cosmetic issues (faded paint, aesthetic improvements, minor park lawn work).

Complaint Details:
Category: ${category}
Title: ${title}
Description: ${description}

Respond strictly with valid JSON format without markdown code blocks:
{"priority": "HIGH" | "MEDIUM" | "LOW", "reason": "concise 1-sentence justification"}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}
