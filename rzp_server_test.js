import fs from 'fs';
import { Buffer } from 'buffer';

function parseDotEnv(path) {
  if (!fs.existsSync(path)) return {};
  const txt = fs.readFileSync(path, 'utf8');
  const lines = txt.split(/\r?\n/);
  const out = {};
  for (const l of lines) {
    const s = l.trim();
    if (!s || s.startsWith('#')) continue;
    const idx = s.indexOf('=');
    if (idx === -1) continue;
    const k = s.slice(0, idx).trim();
    const v = s.slice(idx+1).trim();
    out[k] = v;
  }
  return out;
}

(async function(){
  try {
    const env = parseDotEnv('.env');
    const key = env.RAZORPAY_KEY_ID;
    const secret = env.RAZORPAY_KEY_SECRET;
    if (!key || !secret) {
      console.error('MISSING_KEYS');
      process.exit(2);
    }

    const auth = Buffer.from(key + ':' + secret).toString('base64');
    const body = JSON.stringify({ amount: 5000, currency: 'INR', receipt: 'server_test_'+Date.now() });

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + auth,
      },
      body,
    });

    const text = await res.text();
    console.log('STATUS:' + res.status);
    // try parse json
    try { console.log('BODY:' + JSON.stringify(JSON.parse(text))); } catch(e) { console.log('BODY:' + text); }
  } catch (e) {
    console.error('ERROR:' + (e && e.message));
    process.exit(1);
  }
})();
