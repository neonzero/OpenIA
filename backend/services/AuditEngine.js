const { AuditEngagementUpdateSchema, createAuditEngagement } = require('../domain/auditEngagement');
const { createTimesheet, TimesheetFilterSchema } = require('../domain/timesheet');
const {
  WorkingPaperFilterSchema,
  WorkingPaperUpdateSchema
} = require('../domain/workingPaper');
const eventBus = require('../mq/eventBus');

const toAuditModel = (record) => ({
  id: record.id.toString(),
  title: record.title,
  owner: record.owner,
  startDate:
    record.start_date instanceof Date ? record.start_date.toISOString().slice(0, 10) : record.startDate,
  endDate: record.end_date instanceof Date ? record.end_date.toISOString().slice(0, 10) : record.endDate,
  status: record.status,
  scope: record.scope ?? undefined
});

const toTimesheetModel = (record) => ({
  id: record.id.toString(),
  auditor: record.auditor_name ?? record.auditor,
  date: record.entry_date instanceof Date ? record.entry_date.toISOString().slice(0, 10) : record.date,
  hours: Number(record.hours_worked ?? record.hours),
  engagement: record.engagement ?? record.project_code
});

const toWorkingPaperModel = (record) => ({
  id: record.id.toString(),
  auditId: record.audit_id ? record.audit_id.toString() : record.auditId,
  name: record.name,
  owner: record.owner,
  status: record.status,
  updatedAt: record.updated_at instanceof Date ? record.updated_at.toISOString() : record.updatedAt
});

class AuditEngine {
  constructor({ auditRepository, timesheetRepository, workingPaperRepository }) {
    this.auditRepository = auditRepository;
    this.timesheetRepository = timesheetRepository;
    this.workingPaperRepository = workingPaperRepository;

    eventBus.subscribe('risk_updated', async (risk) => {
      if (!risk) return;
      const residual = Number(risk.residualRisk ?? risk.residual_score ?? 0);
      if (residual < 16) {
        return;
      }
      const title = `Focused review: ${risk.title}`;
      const existing = await this.auditRepository.findByTitle(title);
      if (!existing) {
        const now = new Date();
        const startDate = now.toISOString().slice(0, 10);
        const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const created = await this.auditRepository.createPlan({
          title,
          owner: risk.owner || 'Risk Office',
          startDate,
          endDate,
          status: 'planned',
          scope: `Auto-generated engagement responding to elevated risk ${risk.title}.`
        });
        eventBus.publish('audit_planned', toAuditModel(created));
      }
    });
  }

  async listAudits(filters = {}) {
    const results = await this.auditRepository.findAll(filters);
    return results.map(toAuditModel);
  }

  async planAudit(input) {
    const plan = createAuditEngagement(input);
    const stored = await this.auditRepository.createPlan(plan);
    const model = toAuditModel(stored);
    eventBus.publish('audit_planned', model);
    return model;
  }

  async updateAudit(id, input) {
    const payload = AuditEngagementUpdateSchema.parse(input);
    const stored = await this.auditRepository.updatePlan(id, payload);
    const model = toAuditModel(stored);
    eventBus.publish('audit_updated', model);
    return model;
  }

  async listTimesheets(filters = {}) {
    const parsed = TimesheetFilterSchema.parse(filters);
    const entries = await this.timesheetRepository.list(parsed);
    return entries.map(toTimesheetModel);
  }

  async recordTimesheet(input) {
    const entry = createTimesheet(input);
    const stored = await this.timesheetRepository.create(entry);
    const model = toTimesheetModel(stored);
    eventBus.publish('timesheet_recorded', model);
    return model;
  }

  async listWorkingPapers(filters = {}) {
    const parsed = WorkingPaperFilterSchema.parse(filters);
    const papers = await this.workingPaperRepository.list(parsed);
    return papers.map(toWorkingPaperModel);
  }

  async updateWorkingPaper(id, input) {
    const payload = WorkingPaperUpdateSchema.parse(input);
    const stored = await this.workingPaperRepository.updateStatus(id, payload.status);
    const model = toWorkingPaperModel(stored);
    eventBus.publish('working_paper_updated', model);
    return model;
  }
}

module.exports = AuditEngine;
