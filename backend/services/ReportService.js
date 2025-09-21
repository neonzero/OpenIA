const { ReportFiltersSchema } = require('../domain/report');

class ReportService {
  constructor({ reportRepository, coreIntegration }) {
    this.reportRepository = reportRepository;
    this.coreIntegration = coreIntegration;
  }

  async listReports(filters = {}) {
    const parsed = ReportFiltersSchema.parse(filters);
    const results = await this.reportRepository.findAll(parsed);
    return results.map((report) => ({
      id: report.id.toString(),
      title: report.title,
      owner: report.owner,
      status: report.status,
      issuedDate: report.issued_date ? report.issued_date.toISOString().slice(0, 10) : ''
    }));
  }

  async getReport(id) {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      return null;
    }
    return {
      id: report.id.toString(),
      title: report.title,
      owner: report.owner,
      status: report.status,
      issuedDate: report.issued_date ? report.issued_date.toISOString().slice(0, 10) : ''
    };
  }

  async generateReport(id) {
    const payload = await this.coreIntegration.generateRiskReport();
    const updated = await this.reportRepository.markAsGenerated(id, payload);
    return {
      id: updated.id.toString(),
      title: updated.title,
      owner: updated.owner,
      status: updated.status,
      issuedDate: updated.issued_date ? updated.issued_date.toISOString().slice(0, 10) : ''
    };
  }
}

module.exports = ReportService;
