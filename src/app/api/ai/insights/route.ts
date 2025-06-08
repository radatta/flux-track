import { createClient } from '@/utils/supabase/server';
import { openai } from '@ai-sdk/openai';
import { generateText, generateObject } from 'ai';
import { getLogById, writeLog } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { SentimentSchema, TagSchema } from '@/lib/db';


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
        const summary = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: `Summarize following log entry in 5-10 words: ${log.notes} \n\n Mood: ${log.mood} \n\n Energy: ${log.energy}`,
        });

        // Sentiment analysis using OpenAI
        const sentiment = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: SentimentSchema,
            prompt: `Analyze the sentiment of the following log entry. Log: ${log.notes} \n\n Mood: ${log.mood} \n\n Energy: ${log.energy}`,
        });

        // Tag extraction using OpenAI
        const tags = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: z.array(TagSchema),
            prompt: `Extract keywords from the following log entry. Log: ${log.notes} \n\n Mood: ${log.mood} \n\n Energy: ${log.energy}`,
        });

        await writeLog(supabase, {
            ...log,
            // ai_recommendations: insights.text,
            ai_summary: summary.text,
            sentiment: sentiment.object,
            tags: tags.object.map((tag) => tag.tag),
        });

        // Respond with the insights
        return NextResponse.json({ message: 'ok' }, { status: 200 });
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
