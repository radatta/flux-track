import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";

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
  const sessionId: string | undefined = body.sessionId;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("exercise_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select("id, completed_at")
    .single();

  if (error) {
    console.error("[POST /api/rehab/session/complete]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
