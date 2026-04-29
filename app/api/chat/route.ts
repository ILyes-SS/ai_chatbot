import { streamText, generateText, type UIMessage, type UIMessagePart, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { updateConversation, getConversationById } from "@/actions/conversations";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import type { SourceItem } from "@/types";

export const maxDuration = 30;


const gateway = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages, chatId, model, useThinking, useWebSearch, projectContext }: { messages: UIMessage[]; chatId: string; model?: string; useThinking?: boolean; useWebSearch?: boolean; projectContext?: string } = await req.json();
  
  const normalizedMessages = messages.map(msg => ({
    ...msg,
    parts: msg.parts?.map(part => {
      if (part.type === "file" && typeof part.url === "string" && part.url.startsWith("data:")) {
        
        const base64Data = part.url.split(",")[1];
        return { ...part, url: base64Data };
      }
      return part;
    })
  }));
  const tools = useWebSearch 
    ? { google_search: google.tools.googleSearch({}) } 
    : undefined;
    const providerOptions = useThinking 
    ? {
        google: {
          thinkingConfig: {
            thinkingBudget: 1024, 
          },
        },
      }
    : undefined;
  const modelToUse = model || "gemini-2.5-flash-lite";

  const systemPrompt = projectContext 
    ? `You are a helpful AI assistant. The user has provided the following project context for this conversation:\n\n<project_context>\n${projectContext}\n</project_context>\n\nPlease keep this context in mind when answering questions or generating code.`
    : "You are a helpful AI assistant.";

  const result = streamText({
    model: gateway(modelToUse),
    messages: await convertToModelMessages(normalizedMessages),
    system: systemPrompt,
    tools,
    providerOptions,
    onFinish: async (event) => {
      const lastUserMessage = messages[messages.length - 1];
      try {
        const providerMeta = event.providerMetadata as Record<string, Record<string, unknown>> | undefined;
        const googleMeta = providerMeta?.google;
        const groundingMetadata = googleMeta?.groundingMetadata;
        
        const modelMessage: UIMessage = { 
          id: event.response.id,
          role: "assistant", 
          parts: event.response.messages.flatMap(m => m.content as UIMessage["parts"]),
          metadata: {
            groundingMetadata,
            sources: (event.sources ?? []) as SourceItem[]
          }
        };

        // console.log("modelMessage");
        // console.dir(modelMessage, {depth: null});

        const existingConv = await getConversationById(chatId);
        let mergedMessages: UIMessage[] = [lastUserMessage, modelMessage];
        let newTitle: string | undefined = undefined;

        if (existingConv.success && existingConv.data) {
          const existingMessages = (existingConv.data.messages ?? []) as UIMessage[];
          const userMsgIndex = existingMessages.findIndex((m) => m.id === lastUserMessage.id);
          
          if (userMsgIndex !== -1) {
            // Regeneration/Edit: Truncate existing and append new
            const msgs = [...existingMessages];
            msgs.splice(userMsgIndex, msgs.length - userMsgIndex, lastUserMessage, modelMessage);
            mergedMessages = msgs;
          } else {
            // Normal message: Append
            mergedMessages = [...existingMessages, lastUserMessage, modelMessage];
            
            if (existingMessages.length === 0 && existingConv.data.title === "New Chat") {
              try {
                let textContent = "";
                if (lastUserMessage.parts) {
                  textContent = lastUserMessage.parts.filter((p): p is { type: 'text'; text: string } => p.type === 'text').map((p) => p.text).join(" ");
                }
                if (textContent) {
                  const titleResult = await generateText({
                    model: gateway(modelToUse),
                    prompt: `Generate a short, concise title (max 5 words) summarizing this chat prompt. Do not use quotes, punctuation at the end, or any prefixes. Prompt: "${textContent}"`
                  });
                  newTitle = titleResult.text.trim();
                }
              } catch (e) {
              }
            }
          }
        }

        await updateConversation(chatId, {
          messages: mergedMessages,
          ...(newTitle ? { title: newTitle } : {}),
        }, { overwriteMessages: true });
      } catch (e) {
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.merge(result.toUIMessageStream({sendReasoning:true}));
        
        const sources = await result.sources;
        if (sources && sources.length > 0) {
          // Sources are written as custom data parts for the UI
          for (const source of sources) {
            writer.write({
              type: 'source-url',
              sourceId: `source-${Date.now()}`,
              url: (source as SourceItem).url || '',
              title: (source as SourceItem).title,
            });
          }
        }
      },
    }),
  });
}
