const { z } = require('../lib/zod');

const ControlSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Control name is required'),
  owner: z.string().min(1, 'Control owner is required'),
  description: z.string().optional(),
  status: z.enum(['effective', 'needs_improvement', 'ineffective']).default('effective'),
});

function validateControl(input) {
  return ControlSchema.parse(input);
}

module.exports = { ControlSchema, validateControl };
