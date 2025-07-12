import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Fetch all available exercises
  const { data, error } = await supabase
    .from("exercises")
    .select("id, slug, name, instructions, media_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("[GET /api/rehab/exercise]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
