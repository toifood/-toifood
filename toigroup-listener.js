#!/usr/bin/env node
// toigroup-listener — pure Claude runner, no local state
// PM2: pm2 start toigroup-listener.js --name toigroup-listener
// Env: MACMINI_TRIGGER_TOKEN, TOIFOOD_CROSS_REPO_TOKEN, QUARTER_OVERRIDE (optional)

const http = require('http');
const { execSync } = require('child_process');

const PORT = 3456;

function handle(req, res) {
  if (req.method !== 'POST' || req.url !== '/would-update') {
    res.writeHead(404).end();
    return;
  }

  const token = req.headers['x-token'];
  if (!token || token !== process.env.MACMINI_TRIGGER_TOKEN) {
    res.writeHead(401).end('Unauthorized');
    return;
  }

  let body = '';
  req.on('data', d => { body += d; });
  req.on('end', () => {
    const { quarter_override } = body ? JSON.parse(body) : {};
    console.log(`[${new Date().toISOString()}] /would-update ts-back${quarter_override ? ` quarter=${quarter_override}` : ''}`);

    try {
      const output = execSync(
        'claude --dangerously-skip-permissions --print "/would-update ts-back"',
        {
          env: {
            ...process.env,
            GH_TOKEN: process.env.TOIFOOD_CROSS_REPO_TOKEN,
            ...(quarter_override ? { QUARTER_OVERRIDE: quarter_override } : {}),
          },
          maxBuffer: 10 * 1024 * 1024,
        }
      ).toString();

      console.log(`[${new Date().toISOString()}] done — ${output.length} bytes`);
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(output);
    } catch (e) {
      console.error(`[${new Date().toISOString()}] error:`, e.message);
      res.writeHead(500).end(e.message);
    }
  });
}

http.createServer(handle).listen(PORT, () => {
  console.log(`toigroup-listener ready on :${PORT}`);
});
