const { z } = require('zod');

const WorkingPaperSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => value.toString()).optional(),
  auditId: z.union([z.string(), z.number()]).transform((value) => value.toString()),
  name: z.string().min(1),
  owner: z.string().min(1),
  status: z.enum(['draft', 'review', 'approved']),
  updatedAt: z.string().optional()
});

const WorkingPaperUpdateSchema = WorkingPaperSchema.pick({ status: true });

const WorkingPaperFilterSchema = z.object({
  auditId: z.string().optional()
});

module.exports = {
  WorkingPaperFilterSchema,
  WorkingPaperSchema,
  WorkingPaperUpdateSchema
};
