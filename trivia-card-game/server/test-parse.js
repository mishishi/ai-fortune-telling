// Test the actual extraction from the real API response
require('dotenv').config();
const https = require('https');

const systemPrompt = `你是AI出题器。只能输出一行纯JSON：{"narrative":"...","question":"...","answer":"..."}`;
const url = process.env.MINIMAX_BASE_URL + '/chat/completions';
const data = JSON.stringify({
  model: process.env.MINIMAX_MODEL,
  messages: [{role:'system', content: systemPrompt}, {role:'user', content:'学科=语文,难度=Lv4,叙事=你正在破解一段加密的语言碎片'}],
  max_tokens: 3000
});
const req = https.request(url, {
  method: 'POST',
  headers: {'Content-Type':'application/json','Authorization':'Bearer '+process.env.MINIMAX_API_KEY}
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const raw = JSON.parse(body).choices[0].message.content;
    console.log('Raw length:', raw.length);
    console.log('Last 150 chars:', JSON.stringify(raw.slice(-150)));
    console.log('First 50:', JSON.stringify(raw.slice(0,50)));

    // Strategy 1: last { to last }
    const lb1 = raw.lastIndexOf('}');
    const s1 = raw.slice(raw.lastIndexOf('{', lb1), lb1+1);
    console.log('\nS1 (last brace to last brace):', JSON.stringify(s1.slice(0,60)));
    try { JSON.parse(s1); console.log('S1: OK'); }
    catch(e) { console.log('S1 error:', e.message.slice(0,80)); }

    // Strategy 2: find {"narrative" - most reliable start marker
    const ns = raw.indexOf('{"narrative"');
    const lb2 = raw.lastIndexOf('}');
    const s2 = raw.slice(ns, lb2+1);
    console.log('\nS2 (narrative start to last }):', JSON.stringify(s2.slice(0,60)));
    try { JSON.parse(s2); console.log('S2: OK'); }
    catch(e) { console.log('S2 error:', e.message.slice(0,80)); }
  });
});
req.on('error', e => console.error(e.message));
req.write(data);
req.end();
