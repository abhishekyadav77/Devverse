import { textLength } from '../../utils/editor.js';

export const calcReadingTime = (html = '') => {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 200));
};

export { textLength };