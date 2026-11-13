// ==========================================================================
// MODERN VILLAGE - AI MULTIMODAL IMAGE & PROBLEM VALIDATOR SERVICE
// Powered by Google Gemini Vision LLM with Local Semantic Engine Fallback
// ==========================================================================

import {
  validateProblemReport,
  SUBMISSION_THRESHOLD,
  ACCEPTED_MESSAGE,
  REJECTED_MESSAGE,
  extractKeywordsFromImageFeatures
} from './aiProblemValidator.js';

export {
  validateProblemReport,
  SUBMISSION_THRESHOLD,
  ACCEPTED_MESSAGE,
  REJECTED_MESSAGE,
  extractKeywordsFromImageFeatures
};

/**
 * Validates whether an uploaded complaint photograph genuinely matches
 * the reported Category, Title, and Description using the AI problem validation system.
 *
 * @param {Object} params
 * @param {string} params.imageBase64 - Data URL (data:image/jpeg;base64,...) or raw base64
 * @param {string} params.category - Complaint category name
 * @param {string} params.title - Complaint title
 * @param {string} params.description - Complaint description
 * @returns {Promise<{
 *   isValid: boolean,
 *   confidence: number,
 *   detectedSubject: string,
 *   reason: string,
 *   status: "accepted" | "rejected",
 *   extracted_keywords: string[],
 *   similarity_score: number,
 *   message: string,
 *   suggestedFix: string|null,
 *   source: string
 * }>}
 */
export async function verifyComplaintImage({ imageBase64, category, title, description }) {
  if (!imageBase64) {
    return {
      isValid: false,
      confidence: 0,
      detectedSubject: 'No photograph provided',
      reason: REJECTED_MESSAGE,
      status: "rejected",
      extracted_keywords: [],
      similarity_score: 0,
      message: REJECTED_MESSAGE,
      suggestedFix: 'Take a clear photograph of the issue using your phone camera.',
      source: 'AI Problem Validation System'
    };
  }

  const result = await validateProblemReport({
    imageBase64,
    category,
    title,
    description
  });

  const isValid = result.status === 'accepted';
  const detectedSubject = result.extracted_keywords.length > 0
    ? result.extracted_keywords.slice(0, 3).join(', ')
    : (category || 'Civic infrastructure item');

  return {
    isValid,
    confidence: result.similarity_score,
    detectedSubject,
    reason: result.message,
    status: result.status,
    extracted_keywords: result.extracted_keywords,
    similarity_score: result.similarity_score,
    message: result.message,
    suggestedFix: isValid ? null : 'Upload an authentic photograph depicting the reported civic hazard.',
    source: 'AI Problem Validation System'
  };
}

/**
 * Compresses an image file in the browser using HTML5 Canvas
 * into a persistent WebP/JPEG base64 Data URL (max 1024x1024, ~100KB).
 * This ensures the image NEVER expires or disappears on reload/logout.
 */
export function compressImageToDataUrl(file, maxWidth = 1024, maxHeight = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to standard JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}
