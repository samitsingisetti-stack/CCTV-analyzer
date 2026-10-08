import { z } from 'zod';

export const EventSchema = z.object({
  start_time: z.number().min(0),
  end_time: z.number().min(0),
  event_type: z.string(),
  description: z.string(),
  severity: z.enum(['Low', 'Medium', 'High']),
  is_anomaly: z.boolean()
});

export const AnalysisResultSchema = z.object({
  total_people: z.number().int().nonnegative(),
  peak_occupancy: z.number().int().nonnegative(),
  summary: z.string(),
  events: z.array(EventSchema)
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type Event = z.infer<typeof EventSchema>;
