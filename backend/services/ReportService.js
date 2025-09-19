class ReportService {
  constructor({ reportRepository, coreIntegration }) {
    this.reportRepository = reportRepository;
    this.coreIntegration = coreIntegration;
  }

  async listReports() {
    return this.reportRepository.findAll();
  }

  async generateAndStoreReport() {
    const summary = await this.coreIntegration.generateRiskReport();
    return this.coreIntegration.persistReport(summary);
  }
}

module.exports = ReportService;
