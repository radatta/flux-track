import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/rehab/session -> start a new session
export async function POST() {
  const supabase = await createClient();

  // Validate user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Note: exerciseSlug is no longer needed since sessions don't track exercises
  // Exercise tracking is now done at the rep level

  // Insert new session
  const { data: session, error: insertError } = await supabase
    .from("exercise_sessions")
    .insert({
      user_id: user.id
    })
    .select("id, started_at")
    .single();

  if (insertError) {
    console.error("[POST /api/rehab/session]", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(session, { status: 201 });
}

// GET /api/rehab/session -> current active session for user
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Build query
  const query = supabase
    .from("exercise_sessions")
    .select(`id, started_at`)
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1);

  const { data: sessions, error } = await query;

  if (error) {
    console.error("[GET /api/rehab/session]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(sessions?.[0] ?? null);
}
