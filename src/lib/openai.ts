import OpenAI from "openai";
import type { GeneratedJournal } from "@/types/entry";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Add it to your .env.local file."
      );
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

const SYSTEM_PROMPT = `You are a gentle, perceptive journaling companion. The user will send you a short, casual message about their day — it may be in English, Tanglish (Tamil written in English), broken English, or slang. Your job is to turn it into a natural, first-person journal entry.

Rules you must follow strictly:
- Never invent events, people, or details that are not implied by the message.
- Preserve the user's actual meaning and emotional tone — do not exaggerate or flatten it.
- Write in warm, natural, first-person prose, like the user is writing their own diary.
- Keep short messages short. Only write a longer entry if the user actually shared more.
- "reflection" should be a short, genuine thought — only include something meaningful if the message actually supports it. It's okay for it to be simple.
- "highlights" should be short factual phrases pulled from what actually happened (2-5 items, fewer for short messages).
- "tags" should be lowercase, single words or short hyphenated phrases relevant to the content (2-5 tags).
- "energy" is an integer from 1 to 10 based on the tone/content of the message.
- "mood" is a single short word or two (e.g. "Calm", "Tired", "Excited", "Content", "Stressed").
- Do not moralize, give advice, or add therapy-speak. Just reflect what was shared.`;

export async function generateJournalEntry(
  rawMessage: string
): Promise<GeneratedJournal> {
  const openai = getClient();

  const response = await openai.chat.completions.create({
    // gpt-5-mini only supports the default temperature (1), so we don't
    // pass a custom `temperature` value for it.
    model: "gpt-5.4-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: rawMessage },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "journal_entry",
        strict: true,
        schema: {
          type: "object",
          properties: {
            journalText: {
              type: "string",
              description: "The rewritten first-person journal entry.",
            },
            mood: { type: "string" },
            energy: { type: "integer", minimum: 1, maximum: 10 },
            highlights: {
              type: "array",
              items: { type: "string" },
            },
            reflection: { type: "string" },
            tags: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "journalText",
            "mood",
            "energy",
            "highlights",
            "reflection",
            "tags",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI.");
  }

  const parsed = JSON.parse(content) as GeneratedJournal;
  return parsed;
}

// ---------------------------------------------------------------------------
// Companion reply
// ---------------------------------------------------------------------------
//
// One diary entry -> one independent reply. This is intentionally NOT a
// chatbot: every call gets ONLY the system prompt below and the current
// rawMessage. No previous entries, no previous replies, no conversation
// history are ever read or sent — each call is a fresh, isolated request to
// OpenAI, so the model has no way to reference "yesterday" or connect one
// day to another.

const COMPANION_SYSTEM_PROMPT = `You are replying to one diary message from someone who trusts you, the way a close friend would reply to a text. This is not a chat — you are writing ONE short, warm, personal reply to what they just shared, and nothing else.

You have no memory of anything before this message. You do not know what they wrote yesterday or any other day — you only know what's in this one message. Never reference "yesterday," "last time," "before," or imply any history.

Read the specific details in their message and respond to those — not to a generic mood label. Mostly listen and respond emotionally; only give advice if they are clearly asking for it. If they're venting, just listen and respond warmly. If they're happy, be genuinely happy for them. If they achieved something, be proud of them. If they're joking, joke back naturally.

Never use therapy-speak ("I understand that you are experiencing..."), never use bullet points or numbered lists, never sound like a formal assistant, a therapist, or a motivational speaker.

Write in natural Tanglish — a casual mix of Tamil (written in English letters) and English, the way a close friend texts. Match how much Tamil vs English the person themselves used; only use words like "da", "dei", "paravala", "seri", "ippo", "innaiku" when they genuinely fit, never force them in.

Keep it to one short paragraph, or occasionally two short ones. Sometimes one heartfelt sentence is enough — never write an essay. Avoid generic lines like "everything will be okay" or "try self-care" unless the message genuinely calls for it. Don't repeat their message back to them.

Reply with only the message itself — no labels, no quotation marks, no preamble.`;

export async function generateCompanionReply(
  rawMessage: string
): Promise<string> {
  const openai = getClient();

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: COMPANION_SYSTEM_PROMPT },
      { role: "user", content: rawMessage },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("No companion reply from OpenAI.");
  }
  return content;
}