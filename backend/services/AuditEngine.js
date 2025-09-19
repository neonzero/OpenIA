const { createAuditEngagement, AuditEngagementSchema } = require('../domain/auditEngagement');
const eventBus = require('../mq/eventBus');

class AuditEngine {
  constructor({ auditRepository }) {
    this.auditRepository = auditRepository;
  }

  async listAudits() {
    return this.auditRepository.findAll();
  }

  async planAudit(input) {
    const engagement = createAuditEngagement({ ...input, status: 'planned' });
    const stored = await this.auditRepository.create(engagement);
    eventBus.publish('audit_planned', stored);
    return stored;
  }

  async updateAudit(id, input) {
    const engagement = AuditEngagementSchema.partial().parse(input);
    const updated = await this.auditRepository.update(id, engagement);
    eventBus.publish('audit_updated', updated);
    return updated;
  }
}

module.exports = AuditEngine;
