import OpenAI from "openai";
import {
  buildSystemPrompt,
  buildUserPrompt,
  llmResultSchema,
  validateStructuredOutput,
} from "./compressLogic";
import type { Format, Mode } from "../../shared/types";

export async function callOpenAICompress(
  text: string,
  format: Format,
  mode: Mode
): Promise<{ compressed: string; legend: Record<string, string>; notes: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });
  const system = buildSystemPrompt(format, mode);
  const user = buildUserPrompt(text);

  const run = async (repair = false) => {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      {
        role: "user",
        content: repair
          ? `${user}\n\nYour previous output was invalid. Return valid JSON with compressed, legend, and notes.`
          : user,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) throw new Error("Empty response from model");

    const parsed = llmResultSchema.parse(JSON.parse(raw));
    const validation = validateStructuredOutput(parsed.compressed, format);

    if (!validation.valid && !repair) {
      return run(true);
    }
    if (!validation.valid) {
      throw new Error(`Invalid ${format} output: ${validation.error}`);
    }

    return parsed;
  };

  return run();
}
