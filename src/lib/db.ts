import { publicLogsUpdateSchema, publicLogsRowSchema } from "@/schemas";
import { type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const EntrySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  mood: z.number(),
  energy: z.number(),
  ai_summary: z.string().nullable(),
});

export type Entry = z.infer<typeof EntrySchema>;

export const SentimentSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  confidence: z.number(),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

export const TagSchema = z.object({
  tag: z.string(),
  confidence: z.number(),
});

export type Tag = z.infer<typeof TagSchema>;

export const getLogById = async (supabase: SupabaseClient, id: string) => {
  const { data, error } = await supabase.from("logs").select("*").eq("id", id);
  if (error) {
    throw error;
  }
  const validation = publicLogsRowSchema.safeParse(data[0]);
  if (!validation.success) {
    console.error("Data validation failed", validation.error);
    console.log(data);
    console.log(validation.error.message);
    throw new Error("Data validation failed", { cause: validation.error });
  }
  return validation.data;
};

export const writeLog = async (
  supabase: SupabaseClient,
  log: z.infer<typeof publicLogsUpdateSchema>
) => {
  const { error } = await supabase.from("logs").update(log).eq("id", log.id);
  if (error) {
    throw error;
  }
};
