"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Zap } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function HeaderSection({
  averageMood,
  averageEnergy,
}: {
  averageMood: number;
  averageEnergy: number;
}) {
  const [userName, setUserName] = useState("");
  // const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || "User");
      }

      // const { data, error } = await supabase.from("logs").select("mood, energy").eq("user_id", user.id).order("created_at", { ascending: false });

      // if (error) {
      //   console.error(error);
      // }

      // setAverageMood(data?.mood.reduce((acc, curr) => acc + curr, 0) / data?.mood.length);
      // setAverageEnergy(data?.energy.reduce((acc, curr) => acc + curr, 0) / data?.energy.length);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      {/* User Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#2D3748] mb-2">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-[#2D3748]/70 text-lg">How are you feeling today?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* <Card className="bg-white border-[#6B8EFF]/20 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#6B8EFF]/10 rounded-lg">
                <Calendar className="h-5 w-5 text-[#6B8EFF]" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Current Streak</p>
                <p className="text-2xl font-bold text-[#2D3748]">
                  {currentStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <Card className="bg-white border-[#6B8EFF]/20 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#A0D8FF]/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-[#6B8EFF]" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Average Mood</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-[#2D3748]">{averageMood}</p>
                  <Badge
                    variant="secondary"
                    className="bg-[#A0D8FF]/20 text-[#6B8EFF] hover:bg-[#A0D8FF]/30"
                  >
                    Good
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#6B8EFF]/20 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#FFB6C1]/20 rounded-lg">
                <Zap className="h-5 w-5 text-[#FFB6C1]" />
              </div>
              <div>
                <p className="text-sm text-[#2D3748]/60">Average Energy</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-[#2D3748]">{averageEnergy}</p>
                  <Badge
                    variant="secondary"
                    className="bg-[#FFB6C1]/20 text-[#FFB6C1] hover:bg-[#FFB6C1]/30"
                  >
                    Moderate
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
