import { generateStudyDeck } from './lib/groq-client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    console.log('Testing Groq generation...');
    try {
        const text = "The mitochondria is the powerhouse of the cell. It generates most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP).";
        const cards = await generateStudyDeck(text, 'Student');
        console.log('Generated Cards:', JSON.stringify(cards, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
