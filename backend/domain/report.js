const { z } = require('zod');

const reportStatusEnum = z.enum(['draft', 'issued']);

const ReportSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => value.toString()).optional(),
  title: z.string().min(1),
  owner: z.string().min(1),
  status: reportStatusEnum.default('draft'),
  issuedDate: z.string().optional()
});

const ReportFiltersSchema = z.object({
  status: reportStatusEnum.optional(),
  owner: z.string().optional()
});

module.exports = {
  ReportFiltersSchema,
  ReportSchema,
  reportStatusEnum
};
