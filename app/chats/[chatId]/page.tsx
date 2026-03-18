"use client";

import { use, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageSquare, Loader2, PaperclipIcon } from "lucide-react";
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
  PromptInputProvider,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  useProviderAttachments,
} from "@/components/ai-elements/prompt-input";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getConversationById } from "@/actions/conversations";

import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";

function AttachmentsDisplay() {
  const { files, remove } = usePromptInputAttachments();
  if (!files || files.length === 0) return null;
  return (
    <Attachments variant="grid" className="px-4 pt-3 pb-0 bg-card">
      {files.map((file) => (
        <Attachment key={file.id} data={file} onRemove={() => remove(file.id)}>
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}


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

  const handleSubmit = async (message: PromptInputMessage) => {
    if (message.text.trim() || message.files?.length > 0) {
      const filesToAttach = await Promise.all(
        (message.files || []).map(async (f) => {
          let url = f.url;
          if (typeof url === "string" && url.startsWith("blob:")) {
            const res = await fetch(url);
            const blob = await res.blob();
            url = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } 
          
          return {
            type: "file",
            mediaType: (f as any).contentType || f.mediaType || "application/octet-stream",
            filename: (f as any).name || f.filename || "attachment",
            url: url,
          };
        })
      );
      
      const validFiles = filesToAttach.filter(Boolean);

      sendMessage({
        text: message.text || "",
        files: validFiles
      } as any);
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
    <PromptInputProvider>
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
                        const key = `${message.id}-part-${i}`;
                        if (part.type === "text") {
                          return (
                            <MessageResponse key={key}>
                              {part.text}
                            </MessageResponse>
                          );
                        }
                        // @ts-ignore - Some older definitions of UIMessage.part might not include 'file'
                        if (part.type === "file") {
                          // @ts-ignore - Handle possible legacy image parts vs standard v5 files
                          const isImage = part.mediaType?.startsWith('image/');
                          // @ts-ignore
                          const url = part.url || part.image;
                          
                          if (isImage) {
                            return (
                              <div key={key} className="mb-2 max-w-[240px]">
                                <img src={url} alt="Attachment" className="rounded-lg border border-border/50 object-cover w-full h-auto" />
                              </div>
                            );
                          } else {
                            return (
                              <div key={key} className="mb-2 max-w-[240px] flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/50 text-xs text-muted-foreground">
                                <PaperclipIcon className="size-4 shrink-0" />
                                {/* @ts-ignore */}
                                <span className="truncate">{part.filename || "Attachment"}</span>
                              </div>
                            );
                          }
                        }
                        return null;
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
          className="w-full relative bg-card border border-border/40 border-t-0 shadow-sm rounded-b-xl flex flex-col"
        >
          <AttachmentsDisplay />
          <div className="relative w-full p-4 pt-3">
            <PromptInputTextarea
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.currentTarget.value)}
              className="pl-12 pr-14 min-h-[60px] pb-4 resize-none rounded-lg bg-background font-medium focus-visible:ring-1 focus-visible:ring-primary/40 border-border/50"
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute left-6 bottom-[22px] size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground">
                  <PaperclipIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <PromptInputActionAddAttachments />
                <PromptInputActionAddScreenshot />
              </DropdownMenuContent>
            </DropdownMenu>

            <PromptInputSubmit
              status={status === "streaming" ? "streaming" : "ready"}
              className="absolute bottom-[22px] right-6 hover:bg-muted font-bold transition-all shadow-none size-8 p-0 flex items-center justify-center"
            />
          </div>
        </PromptInput>
      </div>
    </PromptInputProvider>
  );
}
