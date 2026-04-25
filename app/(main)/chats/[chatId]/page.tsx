"use client";

import { use, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2, PaperclipIcon, ChevronDown, BrainIcon, GlobeIcon, RefreshCcw, Copy, Check } from "lucide-react";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
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
  MessageActions,
  MessageAction,
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
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
} from "@/components/ai-elements/sources";
import {
  Suggestions,
  Suggestion,
} from "@/components/ai-elements/suggestion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getConversationById } from "@/actions/conversations";
import { useProjects } from "@/app/stores/projects-store";
import ChatHeader from "@/app/components/ChatHeader";

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <MessageAction
      tooltip={copied ? "Copied!" : "Copy message"}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
    </MessageAction>
  );
}

  const availableModels = [
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "google" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google" },
  ];

  const initialSuggestions = [
    "How can you help me today?",
    "Tell me a joke",
    "Summarize our conversation",
    "What are some good productivity tips?",
  ];

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const unwrappedParams = use(params);
  const chatId = unwrappedParams.chatId;
  const router = useRouter();

  const [model, setModel] = useState("gemini-2.5-flash-lite");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const { messages, setMessages, status, sendMessage, regenerate } = useChat({
    api: "/api/chat",
    onFinish: () => {
      router.refresh();
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<any>(null);
  const { projects } = useProjects();

  useEffect(() => {
    async function loadChat() {
      if (chatId === "new" || !chatId) {
        setLoading(false);
        return;
      }
      try {
        const chatRes = await getConversationById(chatId);
        
        if (chatRes.success && chatRes.data) {
          setConversation(chatRes.data);
          if (chatRes.data.messages) {
            // Type casting since we trust the database schema matches the expected format
            setMessages(chatRes.data.messages as any);
          }
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

      const activeProject = conversation?.projectId 
        ? projects.find((p: any) => p._id === conversation.projectId) 
        : null;

      sendMessage({
        text: message.text || "",
        files: validFiles
      } as any, {
        body: { 
          chatId, 
          model, 
          useThinking, 
          useWebSearch,
          projectContext: activeProject?.context
        }
      });
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
        <div className="flex-1  overflow-hidden relative  bg-background flex flex-col">
          {conversation && <ChatHeader conversation={conversation} />}
          {/* Header for Model Selector */}
          <div className="h-14 border-b border-border/40 flex items-center px-4 bg-muted/10 shrink-0">
            <ModelSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
              <ModelSelectorTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground hover:text-foreground rounded-lg text-sm font-medium border border-border/50 bg-background/50 hover:bg-muted shadow-sm">
                  <span className="truncate max-w-[150px]">
                    {availableModels.find((m) => m.id === model)?.name || "Select Model"}
                  </span>
                  <ChevronDown className="ml-2 size-4 opacity-50 shrink-0" />
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent>
                <ModelSelectorInput placeholder="Search models..." />
                <ModelSelectorList>
                  <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                  <ModelSelectorGroup>
                    {availableModels.map((m) => (
                      <ModelSelectorItem
                        key={m.id}
                        value={m.id}
                        onSelect={(val) => {
                          setModel(val === m.id.toLowerCase() ? m.id : val);
                          setSelectorOpen(false);
                        }}
                      >
                        <ModelSelectorLogo provider={m.provider} />
                        <ModelSelectorName>{m.name}</ModelSelectorName>
                      </ModelSelectorItem>
                    ))}
                  </ModelSelectorGroup>
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
          </div>
          <Conversation className="flex-1 ">
            <ConversationContent className="px-4 py-6 md:px-8 ">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquare className="size-12 text-muted-foreground/60" />}
                  title="Start a new conversation"
                  description="Type a message below to begin chatting with Gemini"
                />
              ) : (
                messages.map((message) => (
                  <Message from={message.role} key={message.id}>
                    {message.role === "assistant" && (
                      (() => {
                        const sources = [
                          ...(message.metadata?.sources as any[] || []),
                          ...(message.parts?.filter(p => 
                            p.type === "source-url" || 
                            p.type === "source-document" || 
                            p.type === "data-sources"
                          ).flatMap(p => p.type === "data-sources" ? ((p as any).data || []) : [p]) as any[] || [])
                        ];
                        if (sources.length === 0) return null;
                        return (
                          <Sources className="mt-2 px-4">
                            <SourcesTrigger count={sources.length} />
                            <SourcesContent>
                              {sources.map((source: any, idx: number) => (
                                <Source 
                                  key={idx} 
                                  href={source.url || source.uri} 
                                  title={source.title || source.url || source.uri} 
                                />
                              ))}
                            </SourcesContent>
                          </Sources>
                        );
                      })()
                    )}
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
                    {message.role === "assistant" && status !== "streaming" && (
                      <MessageActions className="mt-2 px-1">
                        <CopyButton 
                          text={
                            message.parts?.map(p => p.type === "text" ? p.text : "").join("\n") 
                            // @ts-ignore
                            || message.content 
                            // @ts-ignore
                            || message.text 
                            || ""
                          } 
                        />
                        {messages[messages.length - 1].id === message.id && (
                          <MessageAction 
                            tooltip="Regenerate response" 
                            onClick={() => regenerate({ body: { chatId, model, useThinking, useWebSearch } })}
                          >
                            <RefreshCcw className="size-4" />
                          </MessageAction>
                        )}
                      </MessageActions>
                    )}
                  </Message>
                ))
              )}
            </ConversationContent>
            <ConversationScrollButton className="bg-primary text-white" />
          </Conversation>
        </div>

        <PromptInput
          onSubmit={handleSubmit}
          className="w-full relative bg-card  shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] rounded-xl  flex flex-col pt-4 px-1"
        >
          {messages.length === 0 && (
            <Suggestions className="px-4 pb-2">
              {initialSuggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={(s) => handleSubmit({ text: s, files: [] } as any)}
                />
              ))}
            </Suggestions>
          )}
          <AttachmentsDisplay />
          <PromptInputBody className="px-4">
            <PromptInputTextarea
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.currentTarget.value)}
              className="resize-none font-medium"
            />
          </PromptInputBody>
          <PromptInputFooter className="px-4 pb-4">
            <PromptInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground transition-colors hover:text-foreground">
                    <PaperclipIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <PromptInputActionAddAttachments />
                </DropdownMenuContent>
              </DropdownMenu>

              <PromptInputButton
                onClick={() => setUseThinking(!useThinking)}
                variant={useThinking ? "default" : "ghost"}
                className="rounded-full"
              >
                <BrainIcon size={16} />
                <span className="sr-only sm:not-sr-only">Thinking</span>
              </PromptInputButton>

              <PromptInputButton
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? "default" : "ghost"}
                className="rounded-full"
              >
                <GlobeIcon size={16} />
                <span className="sr-only sm:not-sr-only">Search</span>
              </PromptInputButton>

              <SpeechInput
                onTranscriptionChange={(text) => setInput(prev => prev ? prev + " " + text : text)}
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-surface transition-colors hover:text-foreground hover:bg-muted"
              />
            </PromptInputTools>

            <PromptInputSubmit
              status={status === "streaming" ? "streaming" : "ready"}
              className="hover:bg-muted hover:text-foreground font-bold transition-all shadow-none size-8 p-0 flex items-center justify-center rounded-full"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
  );
}
