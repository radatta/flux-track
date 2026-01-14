"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface PoseHeaderProps {
  currentExercise: string;
  onExerciseChange: (exercise: string) => void;
  exercises: { slug: string; name: string }[];
  autoDetectionEnabled?: boolean;
  showReferenceOverlay?: boolean;
  onToggleReferenceOverlay?: () => void;
}

export default function PoseHeader({
  currentExercise,
  onExerciseChange,
  exercises,
  autoDetectionEnabled = true,
  showReferenceOverlay = true,
  onToggleReferenceOverlay,
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
        <div className="relative">
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
          {autoDetectionEnabled && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              AUTO
            </div>
          )}
        </div>
        {onToggleReferenceOverlay && (
          <Button
            variant={showReferenceOverlay ? "default" : "outline"}
            onClick={onToggleReferenceOverlay}
            className={
              showReferenceOverlay
                ? "bg-[#6B8EFF] hover:bg-[#6B8EFF]/90"
                : "border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
            }
          >
            {showReferenceOverlay ? (
              <Eye className="h-4 w-4 mr-2" />
            ) : (
              <EyeOff className="h-4 w-4 mr-2" />
            )}
            Reference
          </Button>
        )}
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
