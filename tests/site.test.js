const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pages = [
  'index.html',
  'getting-started.html',
  'export.html',
  'privacy.html',
  'security.html',
  'support.html',
  '404.html'
];

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('all expected public pages exist', () => {
  for (const page of pages) {
    assert.equal(fs.existsSync(path.join(root, page)), true, `${page} is missing`);
  }
});

test('pages provide metadata, accessibility basics, and a restrictive CSP', () => {
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /<!doctype html>/i, `${page} lacks a doctype`);
    assert.match(html, /<html lang="en">/, `${page} lacks a language`);
    assert.match(html, /<meta name="viewport"/, `${page} lacks viewport metadata`);
    assert.match(html, /Content-Security-Policy/, `${page} lacks a CSP`);
    assert.match(html, /default-src 'none'/, `${page} CSP is not deny-by-default`);
    assert.match(html, /<title>[^<]+<\/title>/, `${page} lacks a title`);
    assert.match(html, /<main[^>]+id="main"|<main id="main"/, `${page} lacks a main landmark`);
  }
});

test('internal links and referenced local assets resolve', () => {
  const localReference = /(?:href|src)="(?!https?:|#)([^"?#]+)(?:[?#][^"]*)?"/g;

  for (const page of pages) {
    const html = read(page);
    for (const [, reference] of html.matchAll(localReference)) {
      assert.equal(
        fs.existsSync(path.join(root, reference)),
        true,
        `${page} references missing ${reference}`
      );
    }
  }
});

test('site loads no external scripts, styles, frames, or tracking pixels', () => {
  for (const page of pages) {
    const html = read(page);
    assert.doesNotMatch(html, /<script\b/i, `${page} contains a script`);
    assert.doesNotMatch(html, /<iframe\b/i, `${page} contains an iframe`);
    assert.doesNotMatch(html, /<(?:img|link)[^>]+(?:src|href)="https?:/i, `${page} loads an external asset`);
    assert.doesNotMatch(html, /google-analytics|googletagmanager|segment\.com|hotjar/i, `${page} contains tracking`);
    assert.doesNotMatch(html, /\sstyle="/i, `${page} contains inline styles blocked by the CSP`);
  }
});

test('public support pages keep sensitive reports out of public issues', () => {
  const support = read('support.html');
  const security = read('security.html');
  const privacy = read('privacy.html');
  assert.match(support, /never include/i);
  assert.match(security, /private vulnerability reporting/i);
  assert.match(security, /Do not disclose security vulnerabilities in a public GitHub issue/i);
  assert.match(privacy, /Do not include personal, confidential, or diagram data/i);
});

test('trust claims document storage, egress, permissions, and retention', () => {
  const security = read('security.html');
  const privacy = read('privacy.html');
  assert.match(security, /No network egress/i);
  assert.match(security, /write:confluence-file/);
  assert.match(privacy, /same page/i);
  assert.match(privacy, /Retention follows/i);
  assert.match(privacy, /does not automatically delete/i);
});
