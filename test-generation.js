const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
    console.error('ERROR: GROQ_API_KEY is not set.');
    process.exit(1);
}

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey });

async function testGeneration() {
    console.log('Generating study deck from sample text...');
    const boringText = "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the aid of chlorophyll. Photosynthesis in plants involves the green pigment chlorophyll and generates oxygen as a byproduct.";
    const vibe = "Kid";

    try {
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are a viral education creator. Transform textbook text into 5 interactive cards. 
        Output ONLY a JSON array. 
        Vibe: ${vibe} (Kid, Student, or Pro).
        Schema: [{ "id": number, "emoji": string, "hook": string, "content": string, "quiz": string }]`
                },
                { role: "user", content: boringText }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;
        console.log('\n--- Raw Response ---\n');
        console.log(content);

        console.log('\n--- Parsed JSON ---\n');
        const parsed = JSON.parse(content);
        console.dir(parsed, { depth: null, colors: true });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testGeneration();
