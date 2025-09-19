class IIAService {
  constructor() {
    this.standards = ['Independence', 'Objectivity', 'Proficiency', 'Quality Assurance'];
  }

  assessAuditQuality(audit) {
    const metStandards = this.standards.filter(() => audit.status !== 'draft');
    return {
      auditId: audit.id,
      standardsMet: metStandards,
      qualityIndex: metStandards.length / this.standards.length
    };
  }
}

module.exports = IIAService;
