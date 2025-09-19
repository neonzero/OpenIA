const { randomUUID } = require('crypto');
const { AuditEngagementSchema } = require('../domain/auditEngagement');
const { FindingSchema } = require('../domain/finding');

class AuditEngine {
  constructor({ auditRepository, riskEngine, eventBus, coreIntegration, iia }) {
    this.auditRepository = auditRepository;
    this.riskEngine = riskEngine;
    this.eventBus = eventBus;
    this.coreIntegration = coreIntegration;
    this.iia = iia;
  }

  async listAudits() {
    return this.auditRepository.getAllAudits();
  }

  async planAudit(payload) {
    const parsed = AuditEngagementSchema.parse(payload);
    const timestamp = new Date().toISOString();
    const audit = {
      ...parsed,
      id: parsed.id || randomUUID(),
      createdAt: parsed.createdAt || timestamp,
      updatedAt: parsed.updatedAt || timestamp,
    };
    audit.readinessScore = this.iia.evaluateEngagement(audit);
    audit.coverage = await this.computeCoverage(audit);
    await this.auditRepository.createAudit(audit);
    await this.coreIntegration.notifyAudit(audit);
    this.eventBus.publish('audit_planned', { id: audit.id, readinessScore: audit.readinessScore });
    return audit;
  }

  async computeCoverage(audit) {
    const risks = await this.riskEngine.listRisks();
    if (!risks.length) {
      return 0;
    }
    const targeted = risks.filter((risk) => (audit.riskIds || []).includes(risk.id));
    return Math.round((targeted.length / risks.length) * 100);
  }

  async addFinding(auditId, payload) {
    const audit = await this.auditRepository.getAuditById(auditId);
    if (!audit) {
      throw new Error('Audit not found');
    }
    const parsed = FindingSchema.parse(payload);
    const finding = { ...parsed, id: parsed.id || randomUUID() };
    const updated = {
      ...audit,
      findings: [...(audit.findings || []), finding],
      updatedAt: new Date().toISOString(),
    };
    updated.readinessScore = this.iia.evaluateEngagement(updated);
    await this.auditRepository.updateAudit(updated);
    return updated;
  }
}

module.exports = AuditEngine;
