import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeHtml, safeJson } from '../utils/escape.js';
import { detectImageType } from '../utils/imageType.js';
import { buildPagination, parsePagination } from '../utils/pagination.js';
import { escapeRegex } from '../utils/regex.js';
import { sanitizeContent } from '../utils/sanitize.js';
import { slugify } from '../utils/slugify.js';
import { calcReadingTime, textFromHtml } from '../utils/text.js';
import { SORTS, resolveSort } from '../services/listing.service.js';
import { shouldCountView } from '../services/viewTracker.js';

test('slugify', () => {
  assert.equal(slugify('My Journey From Beginner to Full Stack Developer'), 'my-journey-from-beginner-to-full-stack-developer');
  assert.equal(slugify('Hello & World!'), 'hello-and-world');
  assert.equal(slugify('Café Déjà Vu'), 'cafe-deja-vu');
  assert.equal(slugify('   '), '');
  assert.ok(slugify('a'.repeat(200)).length <= 80);
});

test('detectImageType reads real file signatures', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]);
  assert.equal(detectImageType(png), 'png');
  assert.equal(detectImageType(jpeg), 'jpeg');
  assert.equal(detectImageType(Buffer.from('GIF89a000000')), 'gif');
  assert.equal(detectImageType(webp), 'webp');
  assert.equal(detectImageType(Buffer.from('this is not an image')), null);
  assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null);
  assert.equal(detectImageType(Buffer.from('abc')), null);
});

test('sanitizeContent removes dangerous markup', () => {
  const dirty = sanitizeContent('<p>hi</p><script>alert(1)</script><img src="x" onerror="alert(1)">');
  assert.ok(dirty.includes('<p>hi</p>'));
  assert.ok(!dirty.includes('script'));
  assert.ok(!dirty.includes('onerror'));
  assert.ok(!sanitizeContent('<a href="javascript:alert(1)">x</a>').includes('javascript'));
  assert.ok(sanitizeContent('<h1>Title</h1>').includes('<h2>Title</h2>'));
  assert.ok(sanitizeContent('<a href="https://example.com">x</a>').includes('noopener'));
});

test('text helpers', () => {
  const text = textFromHtml('<p>Hello <b>world</b></p><p>Second &amp; third</p>');
  assert.match(text, /Hello world/);
  assert.match(text, /Second & third/);
  assert.ok(!text.includes('<'));
  assert.equal(calcReadingTime(''), 1);
  assert.equal(calcReadingTime(Array(400).fill('word').join(' ')), 2);
  assert.equal(calcReadingTime(Array(401).fill('word').join(' ')), 3);
});

test('escaping', () => {
  assert.equal(escapeHtml(`<script>"&'`), '&lt;script&gt;&quot;&amp;&#39;');
  const json = safeJson({ a: '</script><b>' });
  assert.ok(!json.includes('<'));
  assert.equal(JSON.parse(json).a, '</script><b>');
  const rx = new RegExp(escapeRegex('a.b*c'));
  assert.ok(rx.test('a.b*c'));
  assert.ok(!rx.test('aXbbc'));
});

test('pagination', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 10, skip: 0 });
  assert.deepEqual(parsePagination({ page: '3', limit: '5' }), { page: 3, limit: 5, skip: 10 });
  assert.equal(parsePagination({ limit: '1000' }).limit, 50);
  assert.equal(parsePagination({ page: 'abc' }).page, 1);
  assert.equal(buildPagination({ page: 2, limit: 10 }, 25).pages, 3);
  assert.equal(buildPagination({ page: 1, limit: 10 }, 0).pages, 1);
});

test('resolveSort ignores unsafe input', () => {
  assert.equal(resolveSort('views'), SORTS.views);
  assert.equal(resolveSort('__proto__'), SORTS.latest);
  assert.equal(resolveSort(['views']), SORTS.latest);
  assert.equal(resolveSort(undefined), SORTS.latest);
});

test('view tracker counts a viewer once per article and ignores bots', () => {
  const req = (ip, ua = 'Mozilla/5.0') => ({ ip, get: (h) => (h.toLowerCase() === 'user-agent' ? ua : undefined) });
  assert.equal(shouldCountView(req('1.1.1.1'), 'b1'), true);
  assert.equal(shouldCountView(req('1.1.1.1'), 'b1'), false);
  assert.equal(shouldCountView(req('1.1.1.1'), 'b2'), true);
  assert.equal(shouldCountView(req('2.2.2.2'), 'b1'), true);
  assert.equal(shouldCountView(req('3.3.3.3', 'Googlebot/2.1'), 'b1'), false);
  assert.equal(shouldCountView(req('4.4.4.4', ''), 'b1'), false);
});