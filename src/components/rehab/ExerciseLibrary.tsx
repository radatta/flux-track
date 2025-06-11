"use client";

import { useEffect, useState } from "react";
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

export function ExerciseLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<
    { slug: string; name: string; instructions: string; media_url: string }[]
  >([]);

  // Fetch exercises list
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/rehab/exercise");
        if (!res.ok) throw new Error("Failed to load exercises");
        const data = (await res.json()) as {
          slug: string;
          name: string;
          instructions: string;
          media_url: string;
        }[];
        setExercises(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExercises();
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
                  src={exercise.media_url || "/placeholder.svg"}
                  alt={exercise.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3"></div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-[#2D3748] mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-[#2D3748]/70 text-sm line-clamp-2">
                    {exercise.instructions}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-[#2D3748]/60">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>10 minutes</span>
                  </div>
                  <div>
                    <span>10 reps</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-[#A0D8FF]/20 text-[#6B8EFF]">
                    {exercise.slug}
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
