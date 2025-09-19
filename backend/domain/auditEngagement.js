const { z } = require('zod');
const { FindingSchema } = require('./finding');

const AuditEngagementSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  scope: z.string().min(1),
  status: z.enum(['draft', 'planned', 'in_progress', 'completed']).default('draft'),
  findings: z.array(FindingSchema).default([])
});

function createAuditEngagement(input) {
  return AuditEngagementSchema.parse(input);
}

module.exports = { AuditEngagementSchema, createAuditEngagement };
