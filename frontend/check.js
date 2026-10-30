const fs = require('fs');
try {
  const s = fs.readFileSync('src/data/resume.fallback.json','utf8');
  JSON.parse(s);
  console.log('ok');
} catch(e) {
  console.log('ERR', e.message);
}
