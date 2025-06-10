"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const suggestedQuestions = [
  "When did I last feel anxious?",
  "What helps me feel better when I'm stressed?",
  "What are my mood patterns?",
  "When do I have the most energy?",
  "What activities boost my mood?",
  "How can I improve my overall wellbeing?",
];

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm text-[#2D3748]/60">
        <MessageCircle className="h-4 w-4" />
        <span>Try asking:</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestedQuestions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="text-left justify-start h-auto py-2 px-3 border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/5 hover:border-[#6B8EFF]/40 text-[#2D3748] text-sm"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
