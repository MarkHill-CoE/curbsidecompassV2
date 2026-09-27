const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No API key");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
  contents: [{
    parts: [{ text: "Translate this JSON to Canadian French (fr-CA), Tagalog (tl), and Gurmukhi Punjabi (pa). Return ONLY a JSON object with keys 'fr', 'tl', 'pa':\n{\"hello\": \"Hello world\"}" }]
  }],
  generationConfig: { responseMimeType: "application/json" }
});

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    try {
      const parsed = JSON.parse(body);
      console.log("Response text:", parsed.candidates[0].content.parts[0].text);
    } catch (e) {
      console.log("Error:", body);
    }
  });
});
req.write(data);
req.end();
