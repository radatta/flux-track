import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateText, embed } from "ai";
import { openai } from '@ai-sdk/openai';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { query } = await request.json();

    // Step 1: Generate embedding for the query
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });
    const queryVector = embedding;

    // Step 2: Perform semantic search in Supabase
    const { data: entries } = await supabase.rpc('match_logs', {
      query_embedding: queryVector,
      min_similarity: 0.1,
      match_count: 5,
    });

    // Step 3: Generate an answer using the retrieved entries
    const prompt = `Answer the following question based on the user's journal entries:\nQuestion: ${query}\nEntries: ${JSON.stringify(entries)}`;
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    });

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
