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

    // Fetch sessions for user with their reps to get exercise info and accuracy
    const { data: sessions, error: sessionsError } = await supabase
        .from("exercise_sessions")
        .select(`
      id,
      started_at,
      completed_at,
      exercise_reps (
        exercise_id,
        accuracy,
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
    const weeklyMap: Record<string, { sessions: number; duration: number; accuracySum: number; repCount: number }> = {};
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
    const monthlyMap: Record<string, { sessions: number; accuracySum: number; repCount: number }> = {};

    // Track overall accuracy
    let totalAccuracySum = 0;
    let totalRepCount = 0;

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

        // Calculate session accuracy from reps
        const reps = s.exercise_reps || [];
        const sessionAccuracies = reps
            .map((r) => (r as { accuracy?: number }).accuracy ?? 0)
            .filter((a) => a > 0);
        const sessionAccuracySum = sessionAccuracies.reduce((sum, a) => sum + a, 0);
        const sessionRepCount = sessionAccuracies.length;

        // Add to totals
        totalAccuracySum += sessionAccuracySum;
        totalRepCount += sessionRepCount;

        // weekly
        if (start >= last7) {
            const day = dayNames[start.getDay()];
            weeklyMap[day] = weeklyMap[day] || { sessions: 0, duration: 0, accuracySum: 0, repCount: 0 };
            weeklyMap[day].sessions += 1;
            weeklyMap[day].accuracySum += sessionAccuracySum;
            weeklyMap[day].repCount += sessionRepCount;
            if (end)
                weeklyMap[day].duration += Math.floor((end.getTime() - start.getTime()) / 60000);
        }

        // monthly
        if (start >= last6Months) {
            const month = monthNames[start.getMonth()];
            monthlyMap[month] = monthlyMap[month] || { sessions: 0, accuracySum: 0, repCount: 0 };
            monthlyMap[month].sessions += 1;
            monthlyMap[month].accuracySum += sessionAccuracySum;
            monthlyMap[month].repCount += sessionRepCount;
        }
    });

    const weeklyProgressData = dayNames.map((d) => ({
        day: d,
        sessions: weeklyMap[d]?.sessions || 0,
        duration: weeklyMap[d]?.duration || 0,
        accuracy: weeklyMap[d]?.repCount > 0
            ? Math.round(weeklyMap[d].accuracySum / weeklyMap[d].repCount)
            : 0,
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
        const monthData = monthlyMap[month];
        monthlyData.push({
            month,
            totalSessions: monthData?.sessions || 0,
            avgAccuracy: monthData?.repCount > 0
                ? Math.round(monthData.accuracySum / monthData.repCount)
                : 0,
        });
    }

    // Recent sessions (last 5)
    const recentSessions = sessions
        .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
        .slice(0, 5)
        .map((s) => {
            const reps = s.exercise_reps || [];
            const repCount = reps.length;

            // Calculate session average accuracy
            const accuracies = reps
                .map((r) => (r as { accuracy?: number }).accuracy ?? 0)
                .filter((a) => a > 0);
            const sessionAvgAccuracy = accuracies.length > 0
                ? Math.round(accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length)
                : 0;

            // Find most frequent exercise in session
            let exerciseName = "Unknown";
            if (reps.length > 0) {
                // Count exercise occurrences
                const exerciseCounts = new Map<string, { count: number; name: string }>();
                for (const rep of reps) {
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
                accuracy: sessionAvgAccuracy,
                feedback: sessionAvgAccuracy >= 80 ? "Great form!" : sessionAvgAccuracy >= 60 ? "Good effort" : "",
            };
        });

    // Calculate overall average accuracy
    const avgAccuracy = totalRepCount > 0
        ? Math.round(totalAccuracySum / totalRepCount)
        : 0;

    return NextResponse.json({
        currentStreak: streak,
        totalSessions,
        avgAccuracy,
        totalDuration,
        weeklyProgressData,
        monthlyData,
        recentSessions,
        achievements: [],
    });
}
