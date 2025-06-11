import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";

// POST /api/rehab/session -> start a new session
export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Validate user
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const exerciseSlug: string | undefined = body.exerciseSlug;

    if (!exerciseSlug) {
        return NextResponse.json({ error: "exerciseSlug is required" }, { status: 400 });
    }

    // Find exercise by slug
    const { data: exercise, error: exError } = await supabase
        .from("exercises")
        .select("id")
        .eq("slug", exerciseSlug)
        .single();

    if (exError || !exercise) {
        return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Insert new session
    const { data: session, error: insertError } = await supabase
        .from("exercise_sessions")
        .insert({ user_id: user.id, exercise_id: exercise.id })
        .select("id, started_at, exercise_id")
        .single();

    if (insertError) {
        console.error("[POST /api/rehab/session]", insertError.message);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(session, { status: 201 });
}

// GET /api/rehab/session -> current active session for user (optionally by exerciseSlug)
export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exerciseSlug = searchParams.get("exerciseSlug");

    // Build query
    let query = supabase
        .from("exercise_sessions")
        .select(
            `id, started_at, exercise_id, exercises!exercise_id(id, slug, name)`
        )
        .eq("user_id", user.id)
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(1);

    if (exerciseSlug) {
        // find exercise id first
        const { data: exercise, error: exError } = await supabase
            .from("exercises")
            .select("id")
            .eq("slug", exerciseSlug)
            .single();
        if (!exError && exercise) {
            query = query.eq("exercise_id", exercise.id);
        }
    }

    const { data: sessions, error } = await query;

    if (error) {
        console.error("[GET /api/rehab/session]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(sessions?.[0] ?? null);
} 