"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ConversationHistory } from "./ConversationHistory";
import { useUser } from "@/hooks/useUser";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "insight" | "recommendation";
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export function ChatInterface() {
  const { user, loading: userLoading } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your FluxTrack AI assistant. I can help you understand your mood patterns and provide insights based on your journal entries. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversations from API on mount
  useEffect(() => {
    if (!user || userLoading) return;
    fetch(`/api/conversations?user_id=${user.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setConversations(
            data.map(
              (conv: {
                id: string;
                title: string;
                conversation: Message[];
                created_at: string;
              }) => ({
                id: conv.id,
                title: conv.title,
                messages: conv.conversation.map((msg: Message) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp),
                })),
                createdAt: new Date(conv.created_at),
                updatedAt: new Date(conv.created_at),
              })
            )
          );
        }
      });
  }, [user, userLoading]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateConversationTitle = (firstUserMessage: string): string => {
    const words = firstUserMessage.split(" ").slice(0, 6).join(" ");
    return words.length > 30 ? words.substring(0, 30) + "..." : words;
  };

  const saveCurrentConversation = async () => {
    if (!user || messages.length <= 1) return;
    const now = new Date();
    const firstUserMessage =
      messages.find((m) => m.sender === "user")?.content || "New conversation";
    if (currentConversationId) {
      // Optimistically update UI
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...messages], updatedAt: now }
            : conv
        )
      );
      // Update via API
      await fetch(`/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          conversation: messages,
          title: generateConversationTitle(firstUserMessage),
        }),
      });
    } else {
      // Create new conversation
      const newId = crypto.randomUUID();
      const newConversation: Conversation = {
        id: newId,
        title: generateConversationTitle(firstUserMessage),
        messages: [...messages],
        createdAt: now,
        updatedAt: now,
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newId);
      // Insert via API
      await fetch(`/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          conversation: messages,
          title: generateConversationTitle(firstUserMessage),
        }),
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: content.trim() }),
      });
      const data = await response.json();
      let botContent = data.answer || "Sorry, I couldn't find an answer.";
      if (data.error) {
        botContent = `Error: ${data.error}`;
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botContent,
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, botMessage]);

      // Create a new conversation after the first user message and AI response
      if (!currentConversationId) {
        const newId = crypto.randomUUID();
        const newConversation: Conversation = {
          id: newId,
          title: generateConversationTitle(userMessage.content),
          messages: [userMessage, botMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(newId);
        await fetch(`/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            conversation: [userMessage, botMessage],
            title: generateConversationTitle(userMessage.content),
          }),
        });
      } else {
        // Save subsequent messages to the existing conversation
        await fetch(`/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            conversation: [...messages, userMessage, botMessage],
            title: generateConversationTitle(userMessage.content),
          }),
        });
      }
    } catch (error) {
      console.error(error);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, botMessage]);
      // Save conversation after error message
      if (!currentConversationId) {
        const newId = crypto.randomUUID();
        const newConversation: Conversation = {
          id: newId,
          title: generateConversationTitle(userMessage.content),
          messages: [userMessage, botMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(newId);
        await fetch(`/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            conversation: [userMessage, botMessage],
            title: generateConversationTitle(userMessage.content),
          }),
        });
      } else {
        await fetch(`/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            conversation: [...messages, userMessage, botMessage],
            title: generateConversationTitle(userMessage.content),
          }),
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const startNewConversation = () => {
    saveCurrentConversation();
    setCurrentConversationId(null);
    setMessages([
      {
        id: "1",
        content:
          "Hi! I'm your FluxTrack AI assistant. I can help you understand your mood patterns and provide insights based on your journal entries. What would you like to know?",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      },
    ]);
    setIsHistoryOpen(false);
  };

  const loadConversation = (conversation: Conversation) => {
    saveCurrentConversation();
    setCurrentConversationId(conversation.id);
    setMessages(conversation.messages);
    setIsHistoryOpen(false);
  };

  const deleteConversation = async (conversationId: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      startNewConversation();
    }
    // Delete via API
    await fetch(`/api/conversations`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: conversationId }),
    });
  };

  const renameConversation = async (conversationId: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, title: newTitle } : conv
      )
    );
    await fetch(`/api/conversations`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: conversationId, title: newTitle }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 h-screen flex flex-col">
      {/* Header */}
      <Card className="bg-white border-[#6B8EFF]/20 mb-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#6B8EFF]/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-[#6B8EFF]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2D3748]">AI Insights</h1>
                <p className="text-[#2D3748]/60 text-sm font-normal">
                  Ask questions about your mood patterns and get personalized insights
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={startNewConversation}
                variant="outline"
                size="sm"
                className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
              <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#6B8EFF]/20 hover:bg-[#6B8EFF]/10"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <ConversationHistory
                    conversations={conversations}
                    currentConversationId={currentConversationId}
                    onLoadConversation={loadConversation}
                    onDeleteConversation={deleteConversation}
                    onRenameConversation={renameConversation}
                    onNewConversation={startNewConversation}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="bg-white border-[#6B8EFF]/20 flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
            </div>
          </ScrollArea>

          {/* Suggested Questions (only show when conversation is short) */}
          {messages.length <= 2 && (
            <div className="p-4 border-t border-[#6B8EFF]/10">
              <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-[#6B8EFF]/10">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your mood patterns..."
                className="flex-1 border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
                disabled={isTyping}
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#6B8EFF] hover:bg-[#6B8EFF]/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
