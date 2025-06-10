"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Clock,
  Search,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onLoadConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  onNewConversation: () => void;
}

export function ConversationHistory({
  conversations,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
  onRenameConversation,
  onNewConversation,
}: ConversationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getMessageCount = (conversation: Conversation) => {
    return conversation.messages.filter((m) => m.sender === "user").length;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#6B8EFF]/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2D3748]">Chat History</h2>
          <Button
            onClick={onNewConversation}
            size="sm"
            className="bg-[#6B8EFF] hover:bg-[#6B8EFF]/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#2D3748]/40" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-[#6B8EFF]/30 mx-auto mb-3" />
              <p className="text-[#2D3748]/60 text-sm">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative p-3 rounded-lg border transition-colors cursor-pointer ${
                    currentConversationId === conversation.id
                      ? "bg-[#6B8EFF]/10 border-[#6B8EFF]/30"
                      : "bg-white border-[#6B8EFF]/10 hover:bg-[#6B8EFF]/5 hover:border-[#6B8EFF]/20"
                  }`}
                  onClick={() => onLoadConversation(conversation)}
                >
                  {editingId === conversation.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-sm border-[#6B8EFF]/20 focus:border-[#6B8EFF]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#2D3748] text-sm truncate mb-1">
                            {conversation.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-[#2D3748]/60">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(conversation.updatedAt)}</span>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {getMessageCount(conversation)} questions
                            </Badge>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(conversation);
                            }}
                            className="h-6 w-6 p-0 hover:bg-[#6B8EFF]/10"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {conversation.title}
                                  &quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteConversation(conversation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[#6B8EFF]/10">
        <p className="text-xs text-[#2D3748]/50 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""} saved
        </p>
      </div>
    </div>
  );
}
