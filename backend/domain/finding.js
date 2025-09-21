const { z } = require('../lib/zod');

const FindingSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Finding title is required'),
  description: z.string().min(1, 'Finding description is required'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  remediation: z.string().optional(),
  owner: z.string().optional(),
  dueDate: z.string().optional(),
});

function validateFinding(input) {
  return FindingSchema.parse(input);
}

module.exports = { FindingSchema, validateFinding };

