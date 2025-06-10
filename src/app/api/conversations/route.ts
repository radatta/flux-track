// import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const { data, error } = await supabase
        .from('conversations')
        .select('id, title, conversation, created_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(request: Request) {
    const { user_id, conversation, title } = await request.json();

    if (!user_id || !conversation || !title) {
        return new Response(JSON.stringify({ error: 'User ID, conversation, and title are required' }), { status: 400 });
    }

    const { data, error } = await supabase
        .from('conversations')
        .insert({
            user_id,
            conversation,
            title,
        });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 201 });
}

export async function DELETE(request: Request) {
    const { id } = await request.json();

    if (!id) {
        return new Response(JSON.stringify({ error: 'Conversation ID is required' }), { status: 400 });
    }

    const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(null, { status: 204 });
}

export async function PATCH(request: Request) {
    const { id, title } = await request.json();

    if (!id || !title) {
        return new Response(JSON.stringify({ error: 'Conversation ID and new title are required' }), { status: 400 });
    }

    const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', id);

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Conversation updated successfully' }), { status: 200 });
} 