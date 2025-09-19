const { z } = require('zod');

const ControlSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  owner: z.string().min(1)
});

function createControl(input) {
  return ControlSchema.parse(input);
}

module.exports = { ControlSchema, createControl };
