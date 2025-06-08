"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";

export function LogEntryForm() {
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate } = useSWRConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const moodNum = Number.parseInt(mood);
    const energyNum = Number.parseInt(energy);

    if (!mood || !energy) {
      toast.error(
        "Missing fields: Please fill in both mood and energy levels."
      );
      return;
    }

    if (moodNum < 1 || moodNum > 10 || energyNum < 1 || energyNum > 10) {
      toast.error("Invalid values: Mood and energy must be between 1 and 10.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/log", {
        method: "POST",
        body: JSON.stringify({ mood, energy, notes }),
      });

      if (!res.ok) {
        throw new Error("Failed to log entry");
      }

      const data = await res.json();

      mutate("/api/log");
      toast.success("Entry logged successfully! 🎉");
      // Reset form
      setMood("");
      setEnergy("");
      setNotes("");

      const res2 = await fetch("/api/ai/insights", {
        method: "POST",
        body: JSON.stringify({ logId: data.id }),
      });

      if (!res2.ok) {
        throw new Error("Failed to fetch AI insights");
      }
      await res2.json();

      mutate("/api/log");
      toast.success("AI insights generated successfully! 🎉");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-[#6B8EFF]/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-[#2D3748]">
          <Plus className="h-5 w-5 text-[#6B8EFF]" />
          <span>Log Today&apos;s Entry</span>
        </CardTitle>
        <CardDescription>
          Track your mood and energy levels for today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mood">Mood (1-10)</Label>
              <Input
                id="mood"
                type="number"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="7"
                className="border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy">Energy (1-10)</Label>
              <Input
                id="energy"
                type="number"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                placeholder="6"
                className="border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How are you feeling today? Any thoughts or observations..."
              className="border-[#6B8EFF]/20 focus:border-[#6B8EFF] min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#6B8EFF] hover:bg-[#6B8EFF]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              "Log Entry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
