const { z } = require('zod');
const { ControlSchema } = require('./control');

const RiskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high']),
  controls: z.array(ControlSchema).default([])
});

function createRisk(input) {
  return RiskSchema.parse(input);
}

module.exports = { RiskSchema, createRisk };
