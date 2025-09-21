
const { z } = require('zod');

const riskStatusEnum = z.enum(['open', 'mitigated', 'closed']);

const scoreSchema = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return value;
}, z.number().min(1).max(25));

const dateSchema = z
  .string()
  .optional()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date value'
  });

const RiskInputSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  owner: z.string().min(1),
  inherentRisk: scoreSchema,
  residualRisk: scoreSchema.optional(),
  status: riskStatusEnum.default('open'),
  description: z.string().optional(),
  appetite: scoreSchema.optional(),
  reportedOn: dateSchema
});

const RiskUpdateSchema = RiskInputSchema.partial();

const QuestionnaireResponsesSchema = z.object({
  owner: z.string().min(1),
  riskCategory: z.string().min(1),
  likelihood: scoreSchema,
  impact: scoreSchema,
  description: z.string().min(1),
  controls: z.string().optional()
});

const RiskQuestionnaireSchema = z.object({
  riskId: z.string().optional(),
  responses: QuestionnaireResponsesSchema
});

const RiskFiltersSchema = z.object({
  status: riskStatusEnum.optional(),
  owner: z.string().optional()
});

function createRisk(input) {
  const parsed = RiskInputSchema.parse(input);
  return {
    ...parsed,
    residualRisk: parsed.residualRisk ?? parsed.inherentRisk
  };
}

function updateRisk(input) {
  return RiskUpdateSchema.parse(input);
}

function createRiskFromQuestionnaire(input) {
  const { responses } = RiskQuestionnaireSchema.parse(input);
  const inherentRisk = Number(responses.likelihood) * Number(responses.impact);
  const title = `${responses.riskCategory} risk - ${responses.owner}`;
  return {
    title,
    category: responses.riskCategory,
    owner: responses.owner,
    inherentRisk,
    residualRisk: inherentRisk,
    status: 'open',
    description: responses.description
  };
}

module.exports = {
  riskStatusEnum,
  RiskFiltersSchema,
  RiskInputSchema,
  RiskQuestionnaireSchema,
  RiskUpdateSchema,
  createRisk,
  createRiskFromQuestionnaire,
  updateRisk
};
