import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { publicLogsRowSchema } from "../../../schemas";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { mood, energy, notes } = await req.json();

        const { data: log, error } = await supabase
            .from('logs')
            .insert({ user_id: user.id, mood, energy, notes })
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ id: log[0].id }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        const { data, error } = await supabase.from("logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Validate data using Zod schema
        const validation = z.array(publicLogsRowSchema).safeParse(data);
        if (!validation.success) {
            console.error(validation.error.errors);
            return NextResponse.json({ error: "Data validation failed", details: validation.error.errors }, { status: 500 });
        }

        const validData = validation.data;

        const return_data = {
            average_mood: Math.round(validData.reduce((acc, curr) => acc + curr.mood, 0) / validData.length),
            average_energy: Math.round(validData.reduce((acc, curr) => acc + curr.energy, 0) / validData.length),
            entries: validData
        };

        return NextResponse.json(return_data);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}