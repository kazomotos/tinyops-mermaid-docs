# TinyOps Mermaid documentation

Public documentation and trust center for TinyOps Mermaid for Confluence Cloud.

## Local verification

The site is intentionally dependency-free. Node.js 22 or newer is required only for tests.

```sh
npm test
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Publishing

Pushes to `main` run the link, security, privacy, and metadata checks before deploying the repository root to GitHub Pages. Private vulnerability reporting must remain enabled for the security contact links to work.

The site intentionally has no JavaScript, analytics, cookies, forms, or externally loaded assets.

Provider details are maintained in `legal-notice.html` and linked from every public page footer. Changes to provider or contact information must be reflected in the privacy and support pages and covered by the site tests.
