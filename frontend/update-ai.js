const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'app', 'api', 'ai');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('fetchWithFallback')) {
        return;
    }

    const startIndex = content.indexOf('const response = await fetch("https://openrouter.ai/api/v1/chat/completions"');
    if (startIndex === -1) return;

    // Find the messages array
    const messagesKeyIndex = content.indexOf('"messages":', startIndex);
    if (messagesKeyIndex === -1) return;

    const arrayStartIndex = content.indexOf('[', messagesKeyIndex);
    if (arrayStartIndex === -1) return;

    let brackets = 1;
    let arrayEndIndex = arrayStartIndex + 1;
    while (brackets > 0 && arrayEndIndex < content.length) {
        if (content[arrayEndIndex] === '[') brackets++;
        if (content[arrayEndIndex] === ']') brackets--;
        arrayEndIndex++;
    }

    const messagesArray = content.substring(arrayStartIndex, arrayEndIndex);

    // Find where the response ends
    let endIndex = content.indexOf('message.content;', arrayEndIndex);
    if (endIndex === -1) endIndex = content.indexOf('message.content', arrayEndIndex);
    if (endIndex === -1) return;

    // find the variable name storing the content
    const lineStart = content.lastIndexOf('const ', endIndex);
    if (lineStart === -1 || lineStart < arrayEndIndex) return;
    
    const equalSign = content.indexOf('=', lineStart);
    const varName = content.substring(lineStart + 5, equalSign).trim();
    
    // Replace the block
    const blockToReplace = content.substring(startIndex, endIndex + 16); // up to message.content;
    const replacement = `const { fetchWithFallback } = require('@/lib/ai-fallback');\n    const ${varName} = await fetchWithFallback(${messagesArray});`;

    content = content.replace(blockToReplace, replacement);
    
    // Remove unused OPENROUTER_API_KEY
    content = content.replace(/const\s+OPENROUTER_API_KEY[^;]+;/g, '');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated successfully: ${filePath}`);
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fullPath.endsWith('route.js')) {
            processFile(fullPath);
        }
    }
}

traverseDirectory(directoryPath);
