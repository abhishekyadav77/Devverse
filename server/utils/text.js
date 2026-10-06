import sanitizeHtml from 'sanitize-html';

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

// Plain text from HTML (used for word counts, reading time and excerpts)
export const textFromHtml = (html = '') => {
  const spaced = html.replace(/<\/(p|h[1-6]|li|blockquote|pre|tr|td|th)>|<br\s*\/?>/gi, ' $&');
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, ' ')
    .trim();
};

export const calcReadingTime = (text) => {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 200));
};