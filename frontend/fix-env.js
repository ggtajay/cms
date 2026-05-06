const fs = require('fs');
let content = fs.readFileSync('.env', 'utf16le'); // Try reading as utf16
if (!content.includes('DISABLE')) {
  // Maybe it was partly utf8? Let's just reset it to default and append.
  // actually, let's just create a new utf8 string
}
// Strip null bytes if mixed
content = fs.readFileSync('.env');
let clean = content.toString('utf8').replace(/\0/g, '');
if (!clean.includes('DISABLE_ESLINT_PLUGIN')) {
   clean += '\nDISABLE_ESLINT_PLUGIN=true\n';
}
fs.writeFileSync('.env', clean.trim() + '\n', 'utf8');
