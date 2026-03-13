"use client";

import { use, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageSquare, Loader2 } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { getConversationById } from "@/actions/conversations";

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const unwrappedParams = use(params);
  const chatId = unwrappedParams.chatId;

  const { messages, setMessages, status, sendMessage } = useChat({
    api: "/api/chat",
    body: { chatId },
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChat() {
      if (chatId === "new" || !chatId) {
        setLoading(false);
        return;
      }
      try {
        const response = await getConversationById(chatId);
        if (response.success && response.data?.messages) {
          // Type casting since we trust the database schema matches the expected format
          setMessages(response.data.messages as any);
        }
      } catch (e) {
        console.error("Failed to load conversation:", e);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, [chatId, setMessages]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
      setInput("");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex-1 overflow-hidden relative border border-border/40 rounded-t-xl shadow-sm bg-background flex flex-col">
        <Conversation className="flex-1 overflow-y-auto">
          <ConversationContent className="px-4 py-6 md:px-8">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12 text-muted-foreground/60" />}
                title="Start a new conversation"
                description="Type a message below to begin chatting with Gemini"
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts?.map((part, i) => {
                      switch (part.type) {
                        case "text":
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          );
                        default:
                          return null;
                      }
                    }) || (
                      // Fallback just in case `parts` is not available, try using text directly (for legacy storage compatibility)
                      // @ts-ignore
                      <MessageResponse key={`${message.id}-fallback`}>{message.content || message.text}</MessageResponse>
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <PromptInput
        onSubmit={handleSubmit}
        className="w-full relative bg-card border border-border/40 border-t-0 p-4 shadow-sm rounded-b-xl"
      >
        <PromptInputTextarea
          value={input}
          placeholder="Ask me anything..."
          onChange={(e) => setInput(e.currentTarget.value)}
          className="pr-14 min-h-[60px] pb-4 resize-none rounded-lg bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/40 border-border/50"
        />
        <PromptInputSubmit
          status={status === "streaming" ? "streaming" : "ready"}
          disabled={!input.trim()}
          className="absolute bottom-[22px] right-6 text-foreground hover:bg-muted font-bold transition-all shadow-none size-8 p-0 flex items-center justify-center"
        />
      </PromptInput>
    </div>
  );
}
