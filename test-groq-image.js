const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    fs.writeFileSync('test-image-output.txt', 'ERROR: GROQ_API_KEY is not set.');
    process.exit(1);
}

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey });

async function testImageGeneration() {
    const prompt = "Generate an image of a futuristic city with neon lights.";
    let output = `Attempting to ask Groq togenerate an image...\nPrompt: "${prompt}"\n`;

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant. If asked to generate an image, specificy if you can produce an actual image file or url, or if you can only describe it."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        output += '\n--- Groq Response ---\n';
        output += content;

    } catch (e) {
        output += `\nError: ${e.message}`;
    }

    fs.writeFileSync('test-image-output.txt', output);
    console.log('Output written to test-image-output.txt');
}

testImageGeneration();
