class IIAService {
  evaluateEngagement(audit) {
    const statusScore = {
      planned: 1,
      in_progress: 2,
      completed: 3,
    }[audit.status] || 0;

    const findingsPenalty = (audit.findings || []).reduce((penalty, finding) => {
      switch (finding.severity) {
        case 'critical':
          return penalty + 4;
        case 'high':
          return penalty + 3;
        case 'medium':
          return penalty + 2;
        default:
          return penalty + 1;
      }
    }, 0);

    return Math.max(statusScore * 10 - findingsPenalty, 0);
  }
}

module.exports = IIAService;
