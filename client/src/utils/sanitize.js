import DOMPurify from 'dompurify';

// Second line of defence: the server already sanitizes before saving.
export const cleanHtml = (html = '') => DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });