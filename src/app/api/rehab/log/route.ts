import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";

// POST /api/rehab/log -> insert a rep record
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { sessionId, repNumber, durationSeconds, exerciseSlug, accuracy } = body as {
    sessionId?: string;
    repNumber?: number;
    durationSeconds?: number;
    exerciseSlug?: string;
    accuracy?: number;
  };

  if (!sessionId || !repNumber) {
    return NextResponse.json(
      { error: "sessionId and repNumber are required" },
      { status: 400 }
    );
  }

  // Look up exercise ID if exerciseSlug is provided
  let exerciseId: string | null = null;
  if (exerciseSlug) {
    const { data: exercise, error: exerciseError } = await supabase
      .from("exercises")
      .select("id")
      .eq("slug", exerciseSlug)
      .single();

    if (!exerciseError && exercise) {
      exerciseId = exercise.id;
    }
  }

  const { data, error } = await supabase
    .from("exercise_reps")
    .insert({
      session_id: sessionId,
      rep_number: repNumber,
      duration_seconds: durationSeconds,
      exercise_id: exerciseId,
      completed_at: new Date().toISOString(),
      accuracy: accuracy ?? 0,
    })
    .select("id, rep_number, session_id, accuracy")
    .single();

  if (error) {
    console.error("[POST /api/rehab/log]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// GET /api/rehab/log -> return all reps for current user (optionally by sessionId)
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
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json([], { status: 200 });
  }

  const { data, error } = await supabase
    .from("exercise_reps")
    .select("id, rep_number, duration_seconds, started_at, completed_at, session_id, accuracy")
    .eq("session_id", sessionId);

  if (error) {
    console.error("[GET /api/rehab/log]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
