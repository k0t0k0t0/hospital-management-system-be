import { z } from "@/common/utils/zodExtensions";

export const commonValidations = {
  // Date validations
  date: z.coerce.date(),
  optionalDate: z.coerce.date().nullable().optional(),

  // String validations
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/),

  // Number validations
  positiveNumber: z.number().positive().finite(),
  price: z
    .number()
    .min(0)
    .transform((num) => Number(num.toFixed(2))),

  // Boolean validation
  boolean: z.boolean(),

  // Array validation
  nonEmptyArray: z.array(z.unknown()).min(1),
  optionalArray: z.array(z.string()).nullable().optional(),

  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
  }),

  // Timestamp fields
  timestamps: {
    createdAt: z.date(),
    updatedAt: z.date(),
  },

  // Common optional fields
  optional: {
    string: z.string().nullable().optional(),
    array: z.array(z.string()).nullable().optional(),
    date: z.coerce.date().nullable().optional(),
  },
};
