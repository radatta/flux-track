/*
 * ==========================================
 * |          GENERATED BY SUPAZOD          |
 * ==========================================
 */

import { z } from "zod";
import { type Json } from "../types";

export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.record(z.union([jsonSchema, z.undefined()])),
      z.array(jsonSchema),
    ])
    .nullable()
);

export const publicLogsRowSchema = z.object({
  ai_recommendations: z.string().nullable(),
  ai_summary: z.string().nullable(),
  created_at: z.string(),
  embedding: z.string().nullable(),
  energy: z.number(),
  id: z.string(),
  mood: z.number(),
  notes: z.string().nullable(),
  sentiment: jsonSchema.nullable(),
  tags: z.array(z.string()).nullable(),
  user_id: z.string(),
});

export const publicLogsInsertSchema = z.object({
  ai_recommendations: z.string().optional().nullable(),
  ai_summary: z.string().optional().nullable(),
  created_at: z.string().optional(),
  embedding: z.string().optional().nullable(),
  energy: z.number(),
  id: z.string().optional(),
  mood: z.number(),
  notes: z.string().optional().nullable(),
  sentiment: jsonSchema.optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  user_id: z.string(),
});

export const publicLogsUpdateSchema = z.object({
  ai_recommendations: z.string().optional().nullable(),
  ai_summary: z.string().optional().nullable(),
  created_at: z.string().optional(),
  embedding: z.string().optional().nullable(),
  energy: z.number().optional(),
  id: z.string().optional(),
  mood: z.number().optional(),
  notes: z.string().optional().nullable(),
  sentiment: jsonSchema.optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  user_id: z.string().optional(),
});

export const publicBinaryQuantizeArgsSchema = z.union([
  z.object({
    "": z.string(),
  }),
  z.object({
    "": z.unknown(),
  }),
]);

export const publicBinaryQuantizeReturnsSchema = z.unknown();

export const publicHalfvecAvgArgsSchema = z.object({
  "": z.array(z.number()),
});

export const publicHalfvecAvgReturnsSchema = z.unknown();

export const publicHalfvecOutArgsSchema = z.object({
  "": z.unknown(),
});

export const publicHalfvecOutReturnsSchema = z.unknown();

export const publicHalfvecSendArgsSchema = z.object({
  "": z.unknown(),
});

export const publicHalfvecSendReturnsSchema = z.string();

export const publicHalfvecTypmodInArgsSchema = z.object({
  "": z.array(z.unknown()),
});

export const publicHalfvecTypmodInReturnsSchema = z.number();

export const publicHnswBitSupportArgsSchema = z.object({
  "": z.unknown(),
});

export const publicHnswBitSupportReturnsSchema = z.unknown();

export const publicHnswHalfvecSupportArgsSchema = z.object({
  "": z.unknown(),
});

export const publicHnswHalfvecSupportReturnsSchema = z.unknown();

export const publicHnswSparsevecSupportArgsSchema = z.object({
  "": z.unknown(),
});

export const publicHnswSparsevecSupportReturnsSchema = z.unknown();

export const publicHnswhandlerArgsSchema = z.object({
  "": z.unknown(),
});

export const publicHnswhandlerReturnsSchema = z.unknown();

export const publicIvfflatBitSupportArgsSchema = z.object({
  "": z.unknown(),
});

export const publicIvfflatBitSupportReturnsSchema = z.unknown();

export const publicIvfflatHalfvecSupportArgsSchema = z.object({
  "": z.unknown(),
});

export const publicIvfflatHalfvecSupportReturnsSchema = z.unknown();

export const publicIvfflathandlerArgsSchema = z.object({
  "": z.unknown(),
});

export const publicIvfflathandlerReturnsSchema = z.unknown();

export const publicL2NormArgsSchema = z.union([
  z.object({
    "": z.unknown(),
  }),
  z.object({
    "": z.unknown(),
  }),
]);

export const publicL2NormReturnsSchema = z.number();

export const publicL2NormalizeArgsSchema = z.union([
  z.object({
    "": z.string(),
  }),
  z.object({
    "": z.unknown(),
  }),
  z.object({
    "": z.unknown(),
  }),
]);

export const publicL2NormalizeReturnsSchema = z.string();

export const publicSparsevecOutArgsSchema = z.object({
  "": z.unknown(),
});

export const publicSparsevecOutReturnsSchema = z.unknown();

export const publicSparsevecSendArgsSchema = z.object({
  "": z.unknown(),
});

export const publicSparsevecSendReturnsSchema = z.string();

export const publicSparsevecTypmodInArgsSchema = z.object({
  "": z.array(z.unknown()),
});

export const publicSparsevecTypmodInReturnsSchema = z.number();

export const publicVectorAvgArgsSchema = z.object({
  "": z.array(z.number()),
});

export const publicVectorAvgReturnsSchema = z.string();

export const publicVectorDimsArgsSchema = z.union([
  z.object({
    "": z.string(),
  }),
  z.object({
    "": z.unknown(),
  }),
]);

export const publicVectorDimsReturnsSchema = z.number();

export const publicVectorNormArgsSchema = z.object({
  "": z.string(),
});

export const publicVectorNormReturnsSchema = z.number();

export const publicVectorOutArgsSchema = z.object({
  "": z.string(),
});

export const publicVectorOutReturnsSchema = z.unknown();

export const publicVectorSendArgsSchema = z.object({
  "": z.string(),
});

export const publicVectorSendReturnsSchema = z.string();

export const publicVectorTypmodInArgsSchema = z.object({
  "": z.array(z.unknown()),
});

export const publicVectorTypmodInReturnsSchema = z.number();
