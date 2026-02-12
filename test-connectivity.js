const fs = require('fs');
const path = require('path');

// Try to load .env.local manually since we don't want to rely on dotenv package if it fails
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('ERROR: GROQ_API_KEY is not set or is still the placeholder.');
    console.log('Please edit .env.local and add your actual API key.');
    process.exit(1);
}

console.log('GROQ_API_KEY found (length: ' + apiKey.length + ')');

try {
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey });

    async function test() {
        console.log('Sending test request to Groq...');
        try {
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: 'Say "Hello World"' }],
                model: 'llama-3.3-70b-versatile',
            });
            console.log('Response:', completion.choices[0].message.content);
            console.log('SUCCESS: Groq API connection verified.');
        } catch (e) {
            console.error('API Error:', e.message);
            process.exit(1);
        }
    }

    test();
} catch (e) {
    console.error('Module Error:', e.message);
    console.log('You might need to install groq-sdk if not installed.');
}
