import sanitizeHtml from 'sanitize-html';

// Allow-list matching exactly what the editor can produce.
export const sanitizeContent = (html = '') =>
  sanitizeHtml(html, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 's', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li', 'a', 'img', 'hr',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      th: ['colspan', 'rowspan', 'colwidth'],
      td: ['colspan', 'rowspan', 'colwidth'],
      code: ['class'],
    },
    allowedClasses: { code: ['language-*'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      b: 'strong',
      i: 'em',
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' },
      }),
    },
  });