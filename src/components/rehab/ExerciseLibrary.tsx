"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Play, Clock, BarChart3, Filter } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const exercises = [
  {
    slug: "chin-tuck",
    name: "Chin Tuck",
    description: "Strengthen neck muscles and improve posture by pulling the chin back",
    category: "Neck",
    difficulty: "Beginner",
    duration: "30 seconds",
    reps: "10 reps",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    slug: "head-tilt-right",
    name: "Head Tilt Right",
    description: "Stretch left side neck muscles and improve range of motion",
    category: "Neck",
    difficulty: "Beginner",
    duration: "20 seconds",
    reps: "5 holds",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    slug: "head-tilt-left",
    name: "Head Tilt Left",
    description: "Stretch right side neck muscles and improve flexibility",
    category: "Neck",
    difficulty: "Beginner",
    duration: "20 seconds",
    reps: "5 holds",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    slug: "neck-rotation",
    name: "Neck Rotation",
    description: "Improve neck mobility with controlled rotation movements",
    category: "Neck",
    difficulty: "Intermediate",
    duration: "45 seconds",
    reps: "8 rotations",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    slug: "shoulder-rolls",
    name: "Shoulder Rolls",
    description: "Release shoulder tension with gentle rolling movements",
    category: "Shoulder",
    difficulty: "Beginner",
    duration: "30 seconds",
    reps: "10 rolls",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    slug: "upper-trap-stretch",
    name: "Upper Trap Stretch",
    description: "Target upper trapezius muscles to reduce neck and shoulder tension",
    category: "Shoulder",
    difficulty: "Intermediate",
    duration: "25 seconds",
    reps: "6 holds",
    image: "/placeholder.svg?height=200&width=300",
  },
];

const categories = ["All", "Neck", "Shoulder", "Back", "Core"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export function ExerciseLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || exercise.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D3748] mb-2">Exercise Library</h1>
        <p className="text-[#2D3748]/70">
          Discover rehabilitation exercises tailored to your needs
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border-[#6B8EFF]/20 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3748]/40" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
              />
            </div>

            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-[#6B8EFF]/20">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-40 border-[#6B8EFF]/20">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.slug}
            className="bg-white border-[#6B8EFF]/20 hover:shadow-lg transition-shadow group"
          >
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={exercise.image || "/placeholder.svg"}
                  alt={exercise.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-[#2D3748]/70 text-sm line-clamp-2">
                    {exercise.description}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-[#2D3748]/60">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{exercise.duration}</span>
                  </div>
                  <div>
                    <span>{exercise.reps}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-[#A0D8FF]/20 text-[#6B8EFF]">
                    {exercise.category}
                  </Badge>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button asChild className="flex-1 bg-[#6B8EFF] hover:bg-[#6B8EFF]/90">
                    <Link href={`/rehab/pose?exercise=${exercise.slug}`}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
                  >
                    <Link href={`/rehab/exercise/${exercise.slug}`}>Learn More</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredExercises.length === 0 && (
        <Card className="bg-white border-[#6B8EFF]/20">
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-[#6B8EFF]/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#2D3748] mb-2">
              No exercises found
            </h3>
            <p className="text-[#2D3748]/60">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
