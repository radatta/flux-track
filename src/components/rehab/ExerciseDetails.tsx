"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Play,
  Clock,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface Exercise {
  slug: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  reps: string;
  instructions: string[];
  tips: string[];
  warnings: string[];
}

interface ExerciseDetailProps {
  exercise: Exercise;
}

export function ExerciseDetail({ exercise }: ExerciseDetailProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          asChild
          variant="outline"
          className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
        >
          <Link href="/rehab/exercises">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Exercise Header */}
          <Card className="bg-white border-[#6B8EFF]/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-[#2D3748] mb-2">
                    {exercise.name}
                  </h1>
                  <p className="text-[#2D3748]/70 text-lg">{exercise.description}</p>
                </div>
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img
                  src="/placeholder.svg?height=400&width=600"
                  alt={`${exercise.name} demonstration`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button size="lg" className="bg-white/90 text-[#2D3748] hover:bg-white">
                    <Play className="h-6 w-6 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-[#2D3748]/60">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{exercise.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>{exercise.reps}</span>
                </div>
                <Badge variant="secondary" className="bg-[#A0D8FF]/20 text-[#6B8EFF]">
                  {exercise.category}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-white border-[#6B8EFF]/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-[#6B8EFF]" />
                <span>Step-by-Step Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#6B8EFF] text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-[#2D3748]/80">{instruction}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Tips and Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-[#FFB6C1]" />
                  <span>Tips for Success</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exercise.tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-[#FFB6C1] rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-[#2D3748]/80">{tip}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#6B8EFF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Safety Warnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {exercise.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-[#2D3748]/80">{warning}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Start Exercise */}
          <Card className="bg-gradient-to-br from-[#6B8EFF]/10 to-[#A0D8FF]/10 border-[#6B8EFF]/20">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-[#2D3748] mb-4">Ready to start?</h3>
              <Button
                asChild
                size="lg"
                className="w-full bg-[#6B8EFF] hover:bg-[#6B8EFF]/90 mb-3"
              >
                <Link href={`/rehab/pose?exercise=${exercise.slug}`}>
                  <Play className="h-5 w-5 mr-2" />
                  Start Exercise
                </Link>
              </Button>
              <p className="text-xs text-[#2D3748]/60">
                Get real-time feedback with AI pose estimation
              </p>
            </CardContent>
          </Card>

          {/* Exercise Stats */}
          <Card className="bg-white border-[#6B8EFF]/20">
            <CardHeader>
              <CardTitle className="text-lg">Exercise Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#2D3748]/60">Duration</span>
                <span className="font-medium text-[#2D3748]">{exercise.duration}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-[#2D3748]/60">Repetitions</span>
                <span className="font-medium text-[#2D3748]">{exercise.reps}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-[#2D3748]/60">Difficulty</span>
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-[#2D3748]/60">Category</span>
                <span className="font-medium text-[#2D3748]">{exercise.category}</span>
              </div>
            </CardContent>
          </Card>

          {/* Related Exercises */}
          <Card className="bg-white border-[#6B8EFF]/20">
            <CardHeader>
              <CardTitle className="text-lg">Related Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Link
                  href="/rehab/exercise/head-tilt-left"
                  className="block p-2 rounded hover:bg-[#6B8EFF]/5"
                >
                  <p className="font-medium text-sm text-[#2D3748]">Head Tilt Left</p>
                  <p className="text-xs text-[#2D3748]/60">Neck • Beginner</p>
                </Link>
                <Link
                  href="/rehab/exercise/neck-rotation"
                  className="block p-2 rounded hover:bg-[#6B8EFF]/5"
                >
                  <p className="font-medium text-sm text-[#2D3748]">Neck Rotation</p>
                  <p className="text-xs text-[#2D3748]/60">Neck • Intermediate</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
