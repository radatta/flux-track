"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-[80%]">
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="bg-[#6B8EFF]/10 text-[#6B8EFF]">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="mx-3">
          <div className="bg-white border border-[#6B8EFF]/20 rounded-lg px-4 py-3">
            <div className="flex space-x-1">
              <div
                className="w-2 h-2 bg-[#6B8EFF]/60 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#6B8EFF]/60 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#6B8EFF]/60 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
