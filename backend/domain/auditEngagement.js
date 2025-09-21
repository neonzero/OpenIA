
const { z } = require('zod');

const statusEnum = z.enum(['planned', 'in-progress', 'complete']);

const dateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Invalid date format'
});

const AuditEngagementSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((value) => value.toString()).optional(),
    title: z.string().min(1),
    owner: z.string().min(1),
    startDate: dateSchema,
    endDate: dateSchema,
    status: statusEnum.default('planned'),
    scope: z.string().optional(),
    description: z.string().optional()
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    message: 'End date must be after the start date',
    path: ['endDate']
  });

const AuditEngagementUpdateSchema = AuditEngagementSchema.pick({
  owner: true,
  startDate: true,
  endDate: true,
  status: true,
  scope: true,
  description: true,
  title: true
})
  .partial()
  .refine((value) => {
    if (!value.startDate || !value.endDate) {
      return true;
    }
    return new Date(value.endDate) >= new Date(value.startDate);
  }, {
    message: 'End date must be after the start date',
    path: ['endDate']
  });

function createAuditEngagement(input) {
  const parsed = AuditEngagementSchema.parse(input);
  return parsed;
}

module.exports = { AuditEngagementSchema, AuditEngagementUpdateSchema, createAuditEngagement };
