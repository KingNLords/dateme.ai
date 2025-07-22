import { ChatMood, UserPreferences } from "@/store/chatStore";

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
    currentMood: ChatMood = "Romantic", // Default mood for robustness
    userPreferences?: UserPreferences // NEW: Accept UserPreferences
  ): Promise<string> {
    // Generate the system prompt using the mood and user preferences
    const systemPrompt = this.getSystemPrompt(currentMood, userPreferences);

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt }, // System prompt goes first
        ...messages, // User's actual messages follow
      ],
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
        const errorData = await response.json(); // Parse error response for more details
        console.error("OpenAI API error response:", errorData);
        throw new Error(
          `OpenAI API error: ${response.status} - ${
            errorData.error?.message || response.statusText
          }`
        );
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

  // Modified getSystemPrompt to accept UserPreferences
  private getSystemPrompt(
    mood: ChatMood,
    userPreferences?: UserPreferences
  ): string {
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
      TrustBuilder:
        "Focus on building or restoring trust. Speak with clarity, empathy, and honesty. Encourage open communication, reassure loyalty, and acknowledge emotional vulnerability without judgment.",
    };

    let fullPrompt = `${basePrompt}\n\nCurrent mood: ${mood}\n${
      moodPrompts[mood] || moodPrompts.Romantic
    }`;

    // NEW: Added MBTI information to the system prompt if available
    if (userPreferences) {
      fullPrompt += `\n\nUser Profile:`;
      if (userPreferences.name) {
        fullPrompt += ` The user's name is ${userPreferences.name}.`;
      }
      if (userPreferences.partnerName) {
        fullPrompt += ` Their partner's name is ${userPreferences.partnerName}.`;
      }
      if (userPreferences.tone) {
        fullPrompt += ` The user prefers a ${userPreferences.tone} communication tone.`;
      }
      if (userPreferences.loveLanguage) {
        fullPrompt += ` Their primary love language is ${userPreferences.loveLanguage}.`;
      }
      if (userPreferences.mbtiType) {
        fullPrompt += ` The user identifies as an ${userPreferences.mbtiType} personality type.`;
      }
      if (userPreferences.partnerMbtiType) {
        fullPrompt += ` Their partner identifies as an ${userPreferences.partnerMbtiType} personality type.`;
      }

      // Instructions for AI to use MBTI for more intelligent responses
      if (userPreferences.mbtiType || userPreferences.partnerMbtiType) {
        fullPrompt += `\n\nWhen providing advice or insights, leverage the understanding of these MBTI personality types to offer highly intelligent, empathetic, and uniquely tailored responses. For instance, consider how an 'INTJ' might process emotional information differently from an 'ESFP', or how advice might be framed to resonate more with a 'Thinking' versus a 'Feeling' preference. Ensure your responses are human-like, smart, and deeply personalized based on this personality data.`;
      }
    }

    return fullPrompt;
  }
}
