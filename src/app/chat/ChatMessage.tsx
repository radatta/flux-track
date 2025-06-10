"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Lightbulb, TrendingUp } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "insight" | "recommendation";
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === "bot";

  const getMessageBadge = () => {
    if (message.type === "insight") {
      return (
        <Badge className="bg-[#6B8EFF]/10 text-[#6B8EFF] hover:bg-[#6B8EFF]/20 mb-2">
          <TrendingUp className="h-3 w-3 mr-1" />
          Insight
        </Badge>
      );
    }
    if (message.type === "recommendation") {
      return (
        <Badge className="bg-[#FFB6C1]/20 text-[#FFB6C1] hover:bg-[#FFB6C1]/30 mb-2">
          <Lightbulb className="h-3 w-3 mr-1" />
          Recommendation
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex max-w-[80%] ${isBot ? "flex-row" : "flex-row-reverse"}`}>
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback
            className={
              isBot ? "bg-[#6B8EFF]/10 text-[#6B8EFF]" : "bg-[#A0D8FF]/20 text-[#6B8EFF]"
            }
          >
            {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className={`mx-3 ${isBot ? "text-left" : "text-right"}`}>
          {isBot && getMessageBadge()}
          <div
            className={`rounded-lg px-4 py-3 ${
              isBot
                ? "bg-white border border-[#6B8EFF]/20 text-[#2D3748]"
                : "bg-[#6B8EFF] text-white"
            }`}
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
          <div
            className={`text-xs text-[#2D3748]/50 mt-1 ${isBot ? "text-left" : "text-right"}`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
