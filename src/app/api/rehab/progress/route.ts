import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch sessions for user with their reps to get exercise info
    const { data: sessions, error: sessionsError } = await supabase
        .from("exercise_sessions")
        .select(`
      id,
      started_at,
      completed_at,
      exercise_reps (
        exercise_id,
        exercises (
          slug,
          name
        )
      )
    `)
        .eq("user_id", user.id);

    if (sessionsError) {
        console.error("[progress] sessions", sessionsError.message);
        return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    if (!sessions) {
        return NextResponse.json({ error: "No sessions found" }, { status: 404 });
    }

    const totalSessions = sessions.length;

    let totalDuration = 0; // in minutes
    const now = new Date();
    const last7 = new Date(now);
    last7.setDate(now.getDate() - 6);
    const last6Months = new Date(now);
    last6Months.setMonth(now.getMonth() - 5);

    // Helpers
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyMap: Record<string, { sessions: number; duration: number }> = {};
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const monthlyMap: Record<string, { sessions: number }> = {};

    // Current streak calculation
    const datesSet = new Set(
        sessions
            .filter((s) => s.started_at)
            .map((s) => new Date(s.started_at!).toDateString())
    );
    let streak = 0;
    const cursor = new Date(now.toDateString());
    while (datesSet.has(cursor.toDateString())) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    // Aggregate
    sessions.forEach((s) => {
        if (!s.started_at) return;
        const start = new Date(s.started_at);
        const end = s.completed_at ? new Date(s.completed_at) : null;
        if (end) {
            totalDuration += Math.floor((end.getTime() - start.getTime()) / 60000);
        }

        // weekly
        if (start >= last7) {
            const day = dayNames[start.getDay()];
            weeklyMap[day] = weeklyMap[day] || { sessions: 0, duration: 0 };
            weeklyMap[day].sessions += 1;
            if (end)
                weeklyMap[day].duration += Math.floor((end.getTime() - start.getTime()) / 60000);
        }

        // monthly
        if (start >= last6Months) {
            const month = monthNames[start.getMonth()];
            monthlyMap[month] = monthlyMap[month] || { sessions: 0 };
            monthlyMap[month].sessions += 1;
        }
    });

    const weeklyProgressData = dayNames.map((d) => ({
        day: d,
        sessions: weeklyMap[d]?.sessions || 0,
        duration: weeklyMap[d]?.duration || 0,
        accuracy: 0,
    }));

    // Build last 6 months list ending current month
    const monthlyData = [] as {
        month: string;
        totalSessions: number;
        avgAccuracy: number;
    }[];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = monthNames[date.getMonth()];
        monthlyData.push({
            month,
            totalSessions: monthlyMap[month]?.sessions || 0,
            avgAccuracy: 0,
        });
    }

    // Recent sessions (last 5)
    const recentSessions = sessions
        .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
        .slice(0, 5)
        .map((s) => {
            const repCount = s.exercise_reps?.length ?? 0;

            // Find most frequent exercise in session
            let exerciseName = "Unknown";
            if (s.exercise_reps && s.exercise_reps.length > 0) {
                // Count exercise occurrences
                const exerciseCounts = new Map<string, { count: number; name: string }>();
                for (const rep of s.exercise_reps) {
                    const exercise = rep.exercises as unknown as { slug: string; name: string } | null;
                    const id = rep.exercise_id ?? "unknown";
                    const name = exercise?.name ?? exercise?.slug ?? "Unknown";
                    const existing = exerciseCounts.get(id);
                    exerciseCounts.set(id, { count: (existing?.count ?? 0) + 1, name });
                }
                // Get the one with highest count
                let maxCount = 0;
                exerciseCounts.forEach((value) => {
                    if (value.count > maxCount) {
                        maxCount = value.count;
                        exerciseName = value.name;
                    }
                });
            }

            return {
                id: s.id,
                date: s.started_at,
                exercise: exerciseName,
                duration: s.completed_at && s.started_at
                    ? `${Math.floor((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000)} min`
                    : "-",
                reps: repCount,
                accuracy: 0,
                feedback: "",
            };
        });

    return NextResponse.json({
        currentStreak: streak,
        totalSessions,
        avgAccuracy: 0,
        totalDuration,
        weeklyProgressData,
        monthlyData,
        recentSessions,
        achievements: [],
    });
}
