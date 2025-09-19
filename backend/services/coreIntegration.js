class CoreIntegrationService {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.auditNotifications = [];
    this.riskSyncLog = [];
  }

  async syncRisk(risk) {
    const record = {
      id: risk.id,
      syncedAt: new Date().toISOString(),
      status: 'synced',
    };
    this.riskSyncLog.push(record);
    this.eventBus.publish('integration_risk_synced', { riskId: risk.id });
    return record;
  }

  async notifyAudit(audit) {
    const record = {
      id: audit.id,
      notifiedAt: new Date().toISOString(),
      status: 'notified',
    };
    this.auditNotifications.push(record);
    this.eventBus.publish('integration_audit_notified', { auditId: audit.id });
    return record;
  }
}

module.exports = CoreIntegrationService;
