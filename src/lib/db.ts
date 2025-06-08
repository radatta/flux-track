import { publicLogsUpdateSchema, publicLogsRowSchema } from "@/schemas";
import { type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

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

export const writeLog = async (supabase: SupabaseClient, log: z.infer<typeof publicLogsUpdateSchema>) => {
    const { error } = await supabase.from("logs").update(log).eq("id", log.id);
    if (error) {
        throw error;
    }
};