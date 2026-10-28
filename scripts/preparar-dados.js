const fs = require('node:fs');
const path = require('node:path');
const base = path.join(__dirname, '..', 'data');
const data = JSON.parse(fs.readFileSync(path.join(base, 'exemplos.json'), 'utf8'));
fs.writeFileSync(path.join(base, 'exemplos.js'), '// Gerado de exemplos.json por scripts/preparar-dados.js.\nwindow.FITSOCIAL_EXEMPLOS = ' + JSON.stringify(data) + ';\n');
