const fs = require('fs');
const path = require('path');

const dir = 'src/app/api';
const gujaratiRegex = /[\u0A80-\u0AFF]/;
const files = [];

function findFiles(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath);
        } else if (fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (gujaratiRegex.test(content)) {
                files.push(fullPath);
            }
        }
    });
}
findFiles(dir);

let allMatches = new Set();
const stringRegex = /(?:\"([^\"]*[\u0A80-\u0AFF][^\"]*)\")|(?:\'([^\']*[\u0A80-\u0AFF][^\']*)\')|(?:\`([^\`]*[\u0A80-\u0AFF][^\`]*)\`)/g;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = stringRegex.exec(content)) !== null) {
        const str = match[1] || match[2] || match[3];
        if (str) allMatches.add(str.trim());
    }
});

fs.writeFileSync('gujarati_strings.json', JSON.stringify([...allMatches], null, 2));
console.log('Extracted ' + allMatches.size + ' string literals.');
