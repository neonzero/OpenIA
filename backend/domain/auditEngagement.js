const { z } = require('../lib/zod');

const { FindingSchema } = require('./finding');

const AuditEngagementSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Audit title is required'),
  objective: z.string().min(5, 'Audit objective must be at least 5 characters'),
  leadAuditor: z.string().min(1, 'Lead auditor is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['planned', 'in_progress', 'completed']).default('planned'),
  riskIds: z.array(z.string().uuid()).default([]),
  findings: z.array(FindingSchema).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

function validateAuditEngagement(input) {
  return AuditEngagementSchema.parse(input);
}

module.exports = { AuditEngagementSchema, validateAuditEngagement };

