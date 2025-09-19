const { z } = require('zod');

const FindingSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high']),
  remediation: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'closed']).default('open')
});

function createFinding(input) {
  return FindingSchema.parse(input);
}

module.exports = { FindingSchema, createFinding };
