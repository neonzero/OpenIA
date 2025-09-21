const { z } = require('zod');

const numericSchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return value;
}, z.number().min(0));

const dateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date value'
});

const TimesheetSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => value.toString()).optional(),
  auditor: z.string().min(1),
  date: dateSchema,
  hours: numericSchema,
  engagement: z.string().min(1),
  description: z.string().optional()
});

const TimesheetFilterSchema = z.object({
  auditor: z.string().optional()
});

function createTimesheet(input) {
  return TimesheetSchema.parse(input);
}

module.exports = { TimesheetFilterSchema, TimesheetSchema, createTimesheet };
