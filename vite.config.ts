import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// Security: Whitelist of allowed domain suffixes for spreadsheet proxy
const ALLOWED_HOST_SUFFIXES = [
  'docs.google.com',
  'googleusercontent.com',
  'drive.google.com'
];

const MAX_CSV_SIZE_BYTES = 2 * 1024 * 1024; // 2MB payload cap to prevent memory exhaustion DoS
const FETCH_TIMEOUT_MS = 8000; // 8-second circuit breaker timeout

async function handleSheetProxy(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const fullUrl = new URL(req.url || '', 'http://localhost:3000');
    const targetUrlStr = fullUrl.searchParams.get('url');
    if (!targetUrlStr) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing url query parameter' }));
      return;
    }

    let parsedTarget: URL;
    try {
      parsedTarget = new URL(targetUrlStr);
    } catch {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid URL format' }));
      return;
    }

    // SSRF Prevention: Enforce HTTPS scheme only
    if (parsedTarget.protocol !== 'https:') {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Only secure HTTPS spreadsheet endpoints are permitted' }));
      return;
    }

    // SSRF Prevention: Enforce domain whitelist against Google Docs / Spreadsheets domains
    const hostname = parsedTarget.hostname.toLowerCase();
    const isDomainAllowed = ALLOWED_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith('.' + suffix)
    );

    if (!isDomainAllowed) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Destination domain is not in the allowed Google Sheets whitelist' }));
      return;
    }

    // Defensive timeout with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let fetchRes: Response;
    try {
      fetchRes = await fetch(parsedTarget.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'CurbsideCompass-TextSync/1.0'
        }
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!fetchRes.ok) {
      res.statusCode = fetchRes.status;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Remote spreadsheet request failed with HTTP ${fetchRes.status}`);
      return;
    }

    // Check content length header if provided
    const contentLengthHeader = fetchRes.headers.get('content-length');
    if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_CSV_SIZE_BYTES) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Remote spreadsheet exceeds maximum allowed size (2MB)' }));
      return;
    }

    const text = await fetchRes.text();
    if (text.length > MAX_CSV_SIZE_BYTES) {
      res.statusCode = 413;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Remote spreadsheet payload exceeds maximum size limit' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(text);
  } catch (err: unknown) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    // Generic sanitized error message to prevent leaking internal stack trace details
    res.end(JSON.stringify({ error: 'Failed to fetch spreadsheet through secure proxy' }));
  }
}

function sheetProxyPlugin(): Plugin {
  return {
    name: 'sheet-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/sheet-proxy', (req, res) => {
        handleSheetProxy(req, res);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/sheet-proxy', (req, res) => {
        handleSheetProxy(req, res);
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sheetProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
