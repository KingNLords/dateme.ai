export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: {
          url: string;
          detail: "auto" | "low" | "high";
        };
      }>;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL = "https://api.openai.com/v1/chat/completions";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: OpenAIMessage[],
    mood: string = "Romantic"
  ): Promise<string> {
    const systemPrompt = this.getSystemPrompt(mood);

    const payload = {
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 500,
      temperature: 0.8,
    };

    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return (
        data.choices[0]?.message?.content ||
        "I apologize, but I couldn't generate a response right now."
      );
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  }

  private getSystemPrompt(mood: string): string {
    const basePrompt = `You are Dateme.ai, an emotionally intelligent AI assistant dedicated to helping people maintain and strengthen long-distance romantic relationships. You provide personalized conversations, thoughtful advice, and loving emotional support.

Core mission:
- Help couples nurture love, trust, and emotional intimacy across distance
- Reinforce loyalty, communication, and reassurance
- Provide meaningful interactions that bring partners closer

Your personality traits:
- Empathetic and understanding
- Romantic and caring
- Supportive and encouraging
- Insightful about relationships
- Warm and genuine

Guidelines:
- Always reinforce love, trust, and commitment
- Keep responses concise but meaningful (2–3 sentences max)
- Be emotionally supportive and encouraging
- Offer practical relationship advice when appropriate
- Match the user's emotional tone
- Be romantic but respectful
- Help bridge the distance in long-distance relationships`;

    const moodPrompts = {
      Romantic:
        "Respond in a romantic, loving tone. Use gentle, affectionate language and focus on emotional connection.",
      Playful:
        "Be lighthearted, fun, and slightly flirty. Use humor and playful banter while staying supportive.",
      Serious:
        "Be thoughtful and mature. Provide deeper insights and more substantial relationship advice.",
      Supportive:
        "Focus on emotional support and encouragement. Be a caring listener and offer comfort.",
      Flirty:
        "Be charming and mildly flirtatious while maintaining respect and appropriateness.",
      "Trust-Builder":
        "Focus on building or restoring trust. Speak with clarity, empathy, and honesty. Encourage open communication, reassure loyalty, and acknowledge emotional vulnerability without judgment.",
    };

    return `${basePrompt}\n\nCurrent mood: ${mood}\n${
      moodPrompts[mood as keyof typeof moodPrompts] || moodPrompts.Romantic
    }`;
  }
}
