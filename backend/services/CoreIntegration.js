class CoreIntegration {
  constructor({ riskEngine, auditEngine, reportRepository }) {
    this.riskEngine = riskEngine;
    this.auditEngine = auditEngine;
    this.reportRepository = reportRepository;
  }

  async generateRiskReport() {
    const [risks, audits] = await Promise.all([
      this.riskEngine.listRisks(),
      this.auditEngine.listAudits()
    ]);

    const summary = {
      totalRisks: risks.length,
      highSeverityRisks: risks.filter((risk) => risk.severity === 'high').length,
      plannedAudits: audits.filter((audit) => audit.status === 'planned').length
    };

    return summary;
  }

  async persistReport(content) {
    return this.reportRepository.create({
      content: JSON.stringify(content),
      created_at: new Date().toISOString()
    });
  }
}

module.exports = CoreIntegration;
