import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { getLogById, writeLog } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
    const { logId } = await req.json();

    if (!logId || typeof logId !== 'string') {
        return NextResponse.json({ error: 'Log ID is required and must be a string' }, { status: 400 });
    }

    try {
        const supabase = await createClient();

        // Fetch the log entry by ID
        const log = await getLogById(supabase, logId);
        if (!log) {
            console.error('Log not found');
            return NextResponse.json({ error: 'Log not found' }, { status: 404 });
        }

        // Perform AI insights using OpenAI
        const insights = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `Summarize following log entry in 5-10 words: ${log.notes}`,
        });

        await writeLog(supabase, {
            ...log,
            // ai_recommendations: insights.text,
            ai_summary: insights.text,
        });

        // Respond with the insights
        return NextResponse.json({ message: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
