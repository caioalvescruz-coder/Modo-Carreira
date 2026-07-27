const fs = require('fs');
const readline = require('readline');
async function run() {
    const fileStream = fs.createReadStream('C:/Users/larao/.gemini/antigravity/brain/57b194cf-29f7-4317-91e4-a05b4d0910f7/.system_generated/logs/transcript_full.jsonl');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    for await (const line of rl) {
        if (line.includes('taticas-container') && line.includes('index.html')) {
            const obj = JSON.parse(line);
            if (obj.content && obj.content.includes('<div id="taticas-container"')) {
                console.log(obj.content.substring(Math.max(0, obj.content.indexOf('<div id="taticas-container"') - 200), obj.content.indexOf('<div id="taticas-container"') + 600));
                console.log('--- MATCH ---');
                break;
            }
        }
    }
}
run();
