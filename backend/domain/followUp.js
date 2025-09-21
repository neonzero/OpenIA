const { z } = require('zod');

const FollowUpSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => value.toString()).optional(),
  riskId: z.union([z.string(), z.number()]).transform((value) => value.toString()),
  action: z.string().min(1),
  owner: z.string().min(1),
  dueDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid due date'
  }),
  status: z.enum(['pending', 'in-progress', 'complete'])
});

const FollowUpFilterSchema = z.object({
  riskId: z.string().optional()
});

module.exports = { FollowUpFilterSchema, FollowUpSchema };
