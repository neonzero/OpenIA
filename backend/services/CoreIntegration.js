class CoreIntegration {
  constructor({ riskEngine, auditEngine, reportRepository }) {
    this.riskEngine = riskEngine;
    this.auditEngine = auditEngine;
    this.reportRepository = reportRepository;
  }

  async generateRiskReport() {
    const [riskSummary, audits] = await Promise.all([
      this.riskEngine.getSummary(),
      this.auditEngine.listAudits()
    ]);

    const statusBuckets = audits.reduce(
      (acc, audit) => {
        const key = audit.status || 'planned';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      { planned: 0, 'in-progress': 0, complete: 0 }
    );

    return {
      generatedAt: new Date().toISOString(),
      riskSummary,
      auditOverview: {
        total: audits.length,
        byStatus: statusBuckets
      }
    };
  }

  async persistReport(content) {
    return this.reportRepository.create({
      content: JSON.stringify(content),
      created_at: new Date().toISOString()
    });
  }
}

module.exports = CoreIntegration;
