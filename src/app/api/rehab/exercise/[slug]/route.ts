import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: { slug: string } }
) {
    const { slug } = params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("exercises")
        .select("id, slug, name, instructions, media_url")
        .eq("slug", slug)
        .single();

    if (error) {
        console.error(`[GET /api/rehab/exercise/${slug}]`, error.message);
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
} 