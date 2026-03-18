import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { updateConversation } from "@/actions/conversations";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const maxDuration = 30;

// Initialize the gateway
const gateway = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(req: Request) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } = await req.json();
  
  console.dir(messages, { depth: null });
  console.dir(chatId, { depth: null });
  console.log("RECEIVED MESSAGES:", JSON.stringify(messages, null, 2));
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

  const result = streamText({
    model: gateway("gemini-2.5-flash-lite"),
    messages: await convertToModelMessages(normalizedMessages),
    // onFinish: async ({ response }) => {
    //   // The `messages` array from the client has the new user message at the end
    //   const lastUserMessage = messages[messages.length - 1];
      
    //   // We need to map the response to the UIMessage schema expected by the database
    //   // The `response.messages` in newer AI SDK versions contains the generated model messages
    //   const generatedMessages = response.messages.map(m => ({
    //     id: m.id ?? crypto.randomUUID(),
    //     role: m.role,
    //     parts: "parts" in m ? m.parts : [{ type: "text" as const, text: m.content as string }],
    //     createdAt: new Date()
    //   }));

    //   try {
    //     await updateConversation(chatId, {
    //       messages: [
    //         lastUserMessage,
    //         ...generatedMessages,
    //       ] as any, // Using any for now to bypass strict part type checking, will verify with typecheck
    //     });
    //   } catch (e) {
    //     console.error("Failed to save conversation messages", e);
    //   }
    // },
  });

  return result.toUIMessageStreamResponse();
}
