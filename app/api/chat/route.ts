import { streamText, type UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { updateConversation } from "@/actions/conversations";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

export const maxDuration = 30;

// Initialize the gateway
const gateway = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages, chatId, model, useThinking, useWebSearch }: { messages: UIMessage[]; chatId: string; model?: string; useThinking?: boolean; useWebSearch?: boolean } = await req.json();
  
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

  const result = streamText({
    model: gateway(modelToUse),
    messages: await convertToModelMessages(normalizedMessages),
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

        await updateConversation(chatId, {
          messages: [lastUserMessage, modelMessage as any],
        });
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
