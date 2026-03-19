import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { updateConversation } from "@/actions/conversations";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const maxDuration = 30;

// Initialize the gateway
const gateway = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages, chatId, model }: { messages: UIMessage[]; chatId: string; model?: string } = await req.json();
  
  console.log("MODEL", model)
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

  const modelToUse = model || "gemini-2.5-flash-lite";

  const result = streamText({
    model: gateway(modelToUse),
    messages: await convertToModelMessages(normalizedMessages),
    onFinish: async ( event ) => {
      // // The `messages` array from the client has the new user message at the end
      // const lastUserMessage = messages[messages.length - 1];
      
      // // We need to map the response to the UIMessage schema expected by the database
      // // The `response.messages` in newer AI SDK versions contains the generated model messages
      // const generatedMessages = response.messages.map(m => ({
      //   id: m.id ?? crypto.randomUUID(),
      //   role: m.role,
      //   parts: "parts" in m ? m.parts : [{ type: "text" as const, text: m.content as string }],
      //   createdAt: new Date()
      // }));
      // console.log("EVENT")
      // console.dir(event, { depth: null })
      console.log("messages")
      console.dir(messages, { depth: null })
      try {
        const modelMessage = { parts: (event.response.messages.map(m => {return m.content})).flat(), role: "assistant", id: event.response.id }
        
        console.log("modelMessage")
        console.dir(modelMessage, { depth: null })

        const {success, error} = await updateConversation(chatId, {
          messages: [...messages, modelMessage] as any,
        });
        console.log("SUCCESS", success)
        console.log("ERROR", error)
      } catch (e) {
        console.error("Failed to save conversation messages", e);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
