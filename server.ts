import express, { Request, Response } from 'express';
import https from 'https';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const TARGET_HOST = 'pwmarco-og-06656c44b005-d9e101c9f09c.herokuapp.com';

// Path to downloaded GB STUDY logo and banners
const LOGO_PATH = path.join(__dirname, 'public', 'gb-study-logo.png');
const TELEGRAM_BANNER_PATH = path.join(__dirname, 'public', 'telegram-banner.png');
const DEFAULT_BATCH_BANNER_PATH = path.join(__dirname, 'public', 'default-batch-banner.png');

// In-memory cache for stream authentication cookies (_svs)
// This ensures that even when browsers block third-party iframe cookies,
// video stream requests (/api/v/*) always authenticate successfully.
let latestSvsCookie = '';
const svsCookieMap = new Map<string, string>();

function getClientId(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'client';
}

// 1. Serve Telegram banner with GB STUDY branding
app.get([
  '/telegram-banner.png',
  /.*telegram-banner.*/i
], (_req: Request, res: Response) => {
  if (fs.existsSync(TELEGRAM_BANNER_PATH)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(TELEGRAM_BANNER_PATH).pipe(res);
  } else {
    res.status(404).end();
  }
});

// 2. Serve Default Batch banner with GB STUDY branding
app.get([
  '/default-batch-banner.png',
  /.*default-batch-banner.*/i,
  /.*file-000000008d1c8211a64b48d531d3d091.*/i
], (_req: Request, res: Response) => {
  if (fs.existsSync(DEFAULT_BATCH_BANNER_PATH)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(DEFAULT_BATCH_BANNER_PATH).pipe(res);
  } else {
    res.status(404).end();
  }
});

// 3. Serve GB STUDY logo & icon for ANY matching logo path
app.get([
  '/logo.png',
  '/gb-study-logo.png',
  '/gb-study-logo-2026.png',
  '/favicon.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  /.*gb-study-logo.*/i,
  /.*pw-marco-logo.*/i
], (_req: Request, res: Response) => {
  if (fs.existsSync(LOGO_PATH)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    fs.createReadStream(LOGO_PATH).pipe(res);
  } else {
    res.redirect(302, 'https://i.ibb.co/Q3g9fGSt/1791541921524.png');
  }
});

// String rewriter for HTML/JS/CSS/JSON
function rewriteContent(text: string): string {
  return text
    // Replace names
    .replace(/PW-MARCO/g, 'GB STUDY')
    .replace(/PW\s+MARCO/g, 'GB STUDY')
    .replace(/pw-marco/g, 'gb-study')
    .replace(/pwmarco/g, 'gbstudy')
    // Replace Telegram links & usernames
    .replace(/https:\/\/t\.me\/official_marco_22/g, 'https://t.me/GBFreestudy')
    .replace(/http:\/\/t\.me\/official_marco_22/g, 'https://t.me/GBFreestudy')
    .replace(/t\.me\/official_marco_22/g, 't.me/GBFreestudy')
    .replace(/@official_marco_22/g, '@GBFreestudy')
    .replace(/official_marco_22/g, 'GBFreestudy')
    // Replace batch banner
    .replace(/https:\/\/i\.ibb\.co\/YT0v1Fcc\/file-000000008d1c8211a64b48d531d3d091\.png/g, '/default-batch-banner.png')
    .replace(/\/\/i\.ibb\.co\/YT0v1Fcc\/file-000000008d1c8211a64b48d531d3d091\.png/g, '/default-batch-banner.png')
    // Replace logo paths
    .replace(/\/pw-marco-logo-2026\.png\?v=pw-marco-2026c/g, '/gb-study-logo.png')
    .replace(/\/pw-marco-logo-2026\.png/g, '/gb-study-logo.png')
    .replace(/pw-marco-logo-2026\.png/g, 'gb-study-logo.png')
    .replace(/\/gb-study-logo-2026\.png\?v=gb-study-2026c/g, '/gb-study-logo.png')
    .replace(/\/gb-study-logo-2026\.png/g, '/gb-study-logo.png')
    .replace(/\/favicon\.png\?v=pw-marco-2026c/g, '/gb-study-logo.png')
    .replace(/\/apple-touch-icon\.png\?v=pw-marco-2026c/g, '/gb-study-logo.png');
}

// Fallback loader if Heroku takes a couple seconds to wake up
function renderWakingUpPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>GB STUDY - Connecting...</title>
  <link rel="icon" type="image/png" href="/gb-study-logo.png">
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #0b1220, #101c2b 50%, #0b1a18);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    .card {
      background: rgba(16, 28, 43, 0.85);
      border: 1px solid rgba(52, 211, 153, 0.25);
      border-radius: 24px;
      padding: 40px 30px;
      max-width: 440px;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    }
    .logo {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      margin: 0 0 10px;
      color: #34d399;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid rgba(52, 211, 153, 0.2);
      border-top-color: #34d399;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn {
      display: inline-block;
      padding: 10px 24px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      border: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="/gb-study-logo.png" alt="GB STUDY" class="logo">
    <div class="spinner"></div>
    <h1>Connecting to GB STUDY...</h1>
    <p>Establishing secure connection with the lecture stream server. Reloading automatically in 3 seconds...</p>
    <button class="btn" onclick="window.location.reload()">Reload Now</button>
  </div>
  <script>
    setTimeout(function() {
      window.location.reload();
    }, 3000);
  </script>
</body>
</html>`;
}

// 2. Full-stack Reverse Proxy with Automatic Stream Authentication Injection
function handleProxy(req: Request, res: Response, retryCount = 0) {
  const clientId = getClientId(req);
  const isStreamRequest = req.path.startsWith('/api/v/');
  const isPrimaryStreamRequest = req.path.startsWith('/api/primary-stream');

  // Build clean sanitized request headers
  const reqHeaders: Record<string, string | string[] | undefined> = {
    host: TARGET_HOST,
    'user-agent':
      (req.headers['user-agent'] as string) ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    accept: (req.headers['accept'] as string) || '*/*',
    'accept-language': (req.headers['accept-language'] as string) || 'en-US,en;q=0.9',
    'accept-encoding': 'identity',
    referer: `https://${TARGET_HOST}/`,
    origin: `https://${TARGET_HOST}`
  };

  // Build client cookie string
  let cookieHeader = (req.headers['cookie'] as string) || '';

  // If this is a video stream request (/api/v/*), ensure the required _svs token is present
  if (isStreamRequest) {
    if (!cookieHeader.includes('_svs=')) {
      const cachedSvs = svsCookieMap.get(clientId) || latestSvsCookie;
      if (cachedSvs) {
        cookieHeader = cookieHeader ? `${cookieHeader}; ${cachedSvs}` : cachedSvs;
      }
    }
  }

  if (cookieHeader) {
    reqHeaders['cookie'] = cookieHeader;
  }

  if (req.headers['content-type']) {
    reqHeaders['content-type'] = req.headers['content-type'];
  }
  if (req.headers['content-length']) {
    reqHeaders['content-length'] = req.headers['content-length'];
  }
  if (req.headers['range']) {
    reqHeaders['range'] = req.headers['range'];
  }

  const options: https.RequestOptions = {
    hostname: TARGET_HOST,
    port: 443,
    path: req.originalUrl || req.url,
    method: req.method,
    headers: reqHeaders,
    timeout: 30000
  };

  let hasEnded = false;

  const proxyReq = https.request(options, (proxyRes) => {
    const statusCode = proxyRes.statusCode || 200;
    const responseHeaders = { ...proxyRes.headers };

    // Capture and cache _svs cookies from Heroku
    if (responseHeaders['set-cookie']) {
      const cookies = responseHeaders['set-cookie'];
      cookies.forEach((c: string) => {
        const svsMatch = c.match(/(_svs=[^;]+)/);
        if (svsMatch && !c.includes('Max-Age=0')) {
          const svsPair = svsMatch[1];
          latestSvsCookie = svsPair;
          svsCookieMap.set(clientId, svsPair);
        }
      });

      // Rewrite cookies for cross-origin iframe compliance (SameSite=None; Secure; Partitioned)
      responseHeaders['set-cookie'] = cookies.map((c: string) => {
        let cookieStr = c.replace(/domain=[^;]+;/gi, '');
        cookieStr = cookieStr.replace(/SameSite=Lax/gi, 'SameSite=None');
        if (!/SameSite=None/i.test(cookieStr)) {
          cookieStr += '; SameSite=None';
        }
        if (!/Secure/i.test(cookieStr)) {
          cookieStr += '; Secure';
        }
        if (!/Partitioned/i.test(cookieStr)) {
          cookieStr += '; Partitioned';
        }
        return cookieStr;
      });
    }

    // Handle temporary upstream dyno waking
    if ((statusCode === 502 || statusCode === 503) && retryCount < 2) {
      proxyRes.resume();
      setTimeout(() => {
        handleProxy(req, res, retryCount + 1);
      }, 1000);
      return;
    }

    const contentType = (responseHeaders['content-type'] || '').toLowerCase();
    const isTextContent =
      contentType.includes('text/') ||
      contentType.includes('application/javascript') ||
      contentType.includes('application/x-javascript') ||
      (contentType.includes('application/json') && !isPrimaryStreamRequest); // NEVER corrupt encrypted stream JSON

    if (isTextContent) {
      const chunks: Buffer[] = [];
      proxyRes.on('data', (chunk) => {
        chunks.push(chunk);
      });

      proxyRes.on('end', () => {
        if (hasEnded) return;
        hasEnded = true;

        let originalBuffer = Buffer.concat(chunks);

        const encoding = (responseHeaders['content-encoding'] || '').toLowerCase();
        try {
          if (encoding === 'gzip') {
            originalBuffer = zlib.gunzipSync(originalBuffer);
            delete responseHeaders['content-encoding'];
          } else if (encoding === 'deflate') {
            originalBuffer = zlib.inflateSync(originalBuffer);
            delete responseHeaders['content-encoding'];
          }
        } catch {
          // ignore
        }

        const originalText = originalBuffer.toString('utf8');

        // Catch Heroku error page and show branded connecting screen
        if (originalText.includes('Application error') && originalText.includes('heroku logs')) {
          if (retryCount < 2) {
            setTimeout(() => {
              handleProxy(req, res, retryCount + 1);
            }, 1200);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(renderWakingUpPage());
          return;
        }

        const modifiedText = rewriteContent(originalText);
        const modifiedBuffer = Buffer.from(modifiedText, 'utf8');

        delete responseHeaders['content-length'];
        delete responseHeaders['transfer-encoding'];
        responseHeaders['content-length'] = modifiedBuffer.length.toString();

        res.writeHead(statusCode, responseHeaders);
        res.end(modifiedBuffer);
      });
    } else {
      // Direct binary/stream pipe for video chunks, primary-stream JSON, and PDFs
      res.writeHead(statusCode, responseHeaders);
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (retryCount < 2) {
      setTimeout(() => {
        handleProxy(req, res, retryCount + 1);
      }, 1000);
    } else if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderWakingUpPage());
    }
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy Error for URL:', req.originalUrl, err);
    if (retryCount < 2) {
      setTimeout(() => {
        handleProxy(req, res, retryCount + 1);
      }, 1000);
    } else if (!res.headersSent) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderWakingUpPage());
    }
  });

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || 'GET')) {
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
}

// 3. Catch-all reverse proxy handler
app.use((req: Request, res: Response) => {
  handleProxy(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GB STUDY full proxy server running on http://0.0.0.0:${PORT}`);
});
