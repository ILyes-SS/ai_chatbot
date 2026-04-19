import { streamText, generateText, type UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { updateConversation, getConversationById } from "@/actions/conversations";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

export const maxDuration = 30;

// Initialize the gateway
const gateway = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages, chatId, model, useThinking, useWebSearch, projectContext }: { messages: UIMessage[]; chatId: string; model?: string; useThinking?: boolean; useWebSearch?: boolean; projectContext?: string } = await req.json();
  
  const normalizedMessages = messages.map(msg => ({
    ...msg,
    parts: msg.parts?.map(part => {
      if (part.type === "file" && typeof part.url === "string" && part.url.startsWith("data:")) {
        // The Google API strictly requires bare base64 for inlineData, without the data URL prefix
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
      console.log("event");
      console.dir(event, {depth: null});

      try {
        const responseMetadata = (event as any).response;
        const metadata = responseMetadata?.providerMetadata?.google || responseMetadata?.metadata?.google;
        const groundingMetadata = metadata?.groundingMetadata;
        
        const modelMessage = { 
          id: event.response.id,
          role: "assistant", 
          parts: event.response.messages.flatMap(m => m.content as any[]),
          metadata: {
            groundingMetadata,
            sources: (event as any).sources || (event as any).response?.sources
          }
        };

        // console.log("modelMessage");
        // console.dir(modelMessage, {depth: null});

        const existingConv = await getConversationById(chatId);
        let mergedMessages = [lastUserMessage, modelMessage as any];
        let newTitle: string | undefined = undefined;

        if (existingConv.success && existingConv.data) {
          const existingMessages = existingConv.data.messages || [];
          const userMsgIndex = existingMessages.findIndex((m: any) => m.id === lastUserMessage.id);
          
          if (userMsgIndex !== -1) {
            // Regeneration/Edit: Truncate existing and append new
            const msgs = [...existingMessages];
            msgs.splice(userMsgIndex, msgs.length - userMsgIndex, lastUserMessage, modelMessage as any);
            mergedMessages = msgs;
          } else {
            // Normal message: Append
            mergedMessages = [...existingMessages, lastUserMessage, modelMessage as any];
            
            if (existingMessages.length === 0 && (existingConv.data as any).title === "New Chat") {
              try {
                // @ts-ignore
                let textContent = lastUserMessage.content || lastUserMessage.text || "";
                if (!textContent && lastUserMessage.parts) {
                  textContent = lastUserMessage.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join(" ");
                }
                console.log("Generating title for prompt: ", textContent);
                if (textContent) {
                  const titleResult = await generateText({
                    model: gateway(modelToUse),
                    prompt: `Generate a short, concise title (max 5 words) summarizing this chat prompt. Do not use quotes, punctuation at the end, or any prefixes. Prompt: "${textContent}"`
                  });
                  newTitle = titleResult.text.trim();
                  console.log("Generated Title:", newTitle);
                }
              } catch (e) {
                console.error("Failed to generate title", e);
              }
            }
          }
        }

        await updateConversation(chatId, {
          messages: mergedMessages,
          ...(newTitle ? { title: newTitle } : {}),
        }, { overwriteMessages: true });
      } catch (e) {
        console.error("Failed to save conversation messages", e);
      }
    },
  });

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        writer.merge(result.toUIMessageStream({sendReasoning:true}));
        
        const sources = await result.sources;
        if (sources && sources.length > 0) {
          writer.write({
            type: 'data-sources',
            id: `sources-${Date.now()}`,
            data: sources,
          } as any);
        }
      },
    }),
  });
}
