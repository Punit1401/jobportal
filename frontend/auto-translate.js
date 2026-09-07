require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dir = 'src/app/api';
const gujaratiRegex = /[\u0A80-\u0AFF]/;
let filesWithGujarati = [];

function findFiles(dirPath) {
    fs.readdirSync(dirPath).forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findFiles(fullPath);
        } else if (fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (gujaratiRegex.test(content)) {
                filesWithGujarati.push(fullPath);
            }
        }
    });
}
findFiles(dir);

async function translateFile(filePath, retryCount = 0) {
    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`Processing ${filePath}...`);
    
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
        console.error("No OPENROUTER_API_KEY in .env");
        return;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemma-4-31b-it",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert developer and translator. 
Your task is to take the provided JavaScript code and translate ONLY the Gujarati strings (both error messages and comments) into English.
DO NOT change any code logic, variable names, or syntax. ONLY translate the Gujarati text to English.
Return the complete translated code without any markdown formatting, backticks, or extra text. Just the raw code.`
                    },
                    {
                        role: "user",
                        content: content
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            let translatedCode = data.choices[0].message.content;
            if (translatedCode.startsWith("```javascript")) {
                translatedCode = translatedCode.replace(/```javascript/g, "");
            }
            if (translatedCode.startsWith("```")) {
                translatedCode = translatedCode.replace(/```/g, "");
            }
            if (translatedCode.endsWith("```")) {
                translatedCode = translatedCode.replace(/```$/g, "");
            }
            translatedCode = translatedCode.trim();
            
            if (translatedCode.includes("NextResponse") || translatedCode.includes("import") || translatedCode.includes("function") || translatedCode.includes("export")) {
                 fs.writeFileSync(filePath, translatedCode, 'utf8');
                 console.log(`Translated and saved: ${filePath}`);
            } else {
                 console.log(`Translation seems invalid for ${filePath}, skipping...`);
            }
        } else {
             console.log(`Failed to translate ${filePath}: ${JSON.stringify(data)}`);
        }

    } catch (e) {
        console.error(`Error translating ${filePath}:`, e.message);
        if (retryCount < 3) {
            console.log(`Retrying ${filePath} in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            await translateFile(filePath, retryCount + 1);
        }
    }
}

async function run() {
    console.log(`Found ${filesWithGujarati.length} files with Gujarati text.`);
    for (const file of filesWithGujarati) {
        await translateFile(file);
        // Wait 3 seconds between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    console.log("All files processed!");
}

run();
