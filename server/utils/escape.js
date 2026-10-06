const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// For HTML text and attribute values (these five entities are also valid in XML)
export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (c) => MAP[c]);
export const escapeXml = escapeHtml;

// JSON for a <script type="application/ld+json"> block. Escapes characters that could
// close the script tag or break out of it.
export const safeJson = (data) =>
  JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');