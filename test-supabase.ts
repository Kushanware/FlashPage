import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables!')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        // 1. Try to read (should work if public)
        const { data: readData, error: readError } = await supabase
            .from('decks')
            .select('*')
            .limit(1)

        if (readError) {
            console.error('READ FAILED:', readError.message)
            // If code is '42P01', table doesn't exist
            if (readError.code === '42P01') {
                console.error('CRITICAL: Table "decks" does not exist. You must run the SQL schema!')
            }
        } else {
            console.log('Read success. Records found:', readData?.length)
        }

        // 2. Try to write a test record
        const { data: writeData, error: writeError } = await supabase
            .from('decks')
            .insert([
                {
                    title: 'Test Deck',
                    description: 'Connectivity Test',
                    cards: [],
                    user_id: '00000000-0000-0000-0000-000000000000'
                }
            ])
            .select()

        if (writeError) {
            console.error('WRITE FAILED:', writeError.message)
            console.error('Error Details:', writeError)
        } else {
            console.log('Write success! Inserted record:', writeData)
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

testConnection()
