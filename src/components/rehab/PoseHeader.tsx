"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Link from "next/link";

interface PoseHeaderProps {
  currentExercise: string;
  onExerciseChange: (exercise: string) => void;
  exercises: { slug: string; name: string }[];
}

export default function PoseHeader({
  currentExercise,
  onExerciseChange,
  exercises,
}: PoseHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2D3748] mb-2">Live Pose Estimation</h1>
        <p className="text-[#2D3748]/70">
          Real-time feedback for your rehabilitation exercises
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <Select value={currentExercise} onValueChange={onExerciseChange}>
          <SelectTrigger className="w-48 border-[#6B8EFF]/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((ex) => (
              <SelectItem key={ex.slug} value={ex.slug}>
                {ex.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild variant="outline" className="border-[#6B8EFF]/20">
          <Link href="/rehab/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
}
