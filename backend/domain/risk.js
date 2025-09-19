const { z } = require('../lib/zod');

const { ControlSchema } = require('./control');

const RiskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Risk title must have at least 3 characters'),
  description: z.string().min(5, 'Risk description must have at least 5 characters'),
  category: z.enum(['strategic', 'financial', 'operational', 'compliance']).default('operational'),
  inherentImpact: z.number().min(1).max(5).default(3),
  inherentLikelihood: z.number().min(1).max(5).default(3),
  residualScore: z.number().min(0).max(25).optional(),
  owner: z.string().min(1, 'Risk owner is required'),
  controls: z.array(ControlSchema).default([]),
  status: z.enum(['open', 'mitigated', 'closed']).default('open'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

function validateRisk(input) {
  return RiskSchema.parse(input);
}

module.exports = { RiskSchema, validateRisk };
