import { z } from "zod";

export const ExaminationStatusEnum = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const ExaminationTypeEnum = z.enum([
  "physical",
  "laboratory",
  "imaging",
  "specialist",
]);

export const ExaminationSchema = z.object({
  id: z.number(),
  patientId: z.number(),
  doctorId: z.number(),
  type: ExaminationTypeEnum,
  status: ExaminationStatusEnum,
  scheduledDate: z.date(),
  duration: z.number(), // in minutes
  notes: z.string().optional(),
  results: z
    .object({
      findings: z.string(),
      recommendations: z.string(),
      attachments: z.array(z.string()).optional(),
    })
    .optional(),
  cancelReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  cancelledAt: z.date().optional(),
});

export type Examination = z.infer<typeof ExaminationSchema>;

export const CreateExaminationSchema = ExaminationSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  cancelledAt: true,
  results: true,
});

export type CreateExamination = z.infer<typeof CreateExaminationSchema>;
