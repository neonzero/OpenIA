class COSOService {
  calculateResidualScore(risk) {
    const inherent = (risk.inherentImpact || 0) * (risk.inherentLikelihood || 0);
    const controlModifier = (risk.controls || []).reduce((score, control) => {
      if (control.status === 'effective') return score - 1;
      if (control.status === 'needs_improvement') return score;
      return score + 1;
    }, 0);
    const residual = Math.max(inherent + controlModifier, 0);
    return residual;
  }

  evaluateControlEnvironment(risk) {
    const total = (risk.controls || []).length;
    if (total === 0) {
      return 'insufficient';
    }
    const effective = (risk.controls || []).filter((control) => control.status === 'effective').length;
    const ratio = effective / total;
    if (ratio > 0.7) return 'strong';
    if (ratio > 0.4) return 'moderate';
    return 'weak';
  }
}

module.exports = COSOService;
