import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Note: we're using gpt-4o-mini as requested by the user. This model was released in July 2024 
// as a more cost-effective alternative to gpt-4o
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getChatResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  systemPrompt: string
): Promise<string> {
  try {
    const chatMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages as ChatCompletionMessageParam[],
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      response_format: { type: "json_object" },
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to get chat response");
  }
}