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

    // Fetch sessions for user
    const { data: sessions, error: sessionsError } = await supabase
        .from("exercise_sessions")
        .select("id, started_at, completed_at, exercise_id")
        .eq("user_id", user.id);

    if (sessionsError) {
        console.error("[dashboard] sessions", sessionsError.message);
        return NextResponse.json({ error: sessionsError.message }, { status: 500 });
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
        sessions.map((s) => new Date(s.started_at).toDateString())
    );
    let streak = 0;
    const cursor = new Date(now.toDateString());
    while (datesSet.has(cursor.toDateString())) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    // Aggregate
    sessions.forEach((s) => {
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
            if (end) weeklyMap[day].duration += Math.floor((end.getTime() - start.getTime()) / 60000);
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
    const monthlyData = [] as { month: string; totalSessions: number; avgAccuracy: number }[];
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
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
        .slice(0, 5)
        .map((s) => ({
            id: s.id,
            date: s.started_at,
            exercise: s.exercise_id, // slug placeholder
            duration: s.completed_at
                ? `${Math.floor((new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 60000)} min`
                : "-",
            reps: 0,
            accuracy: 0,
            feedback: "",
        }));

    // Achievements placeholder
    // const achievements: any[] = [];

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