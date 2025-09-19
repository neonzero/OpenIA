class FeedbackService {
  constructor() {
    this.records = [];
  }

  captureFeedback(type, payload) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
    };
    this.records.push(entry);
    return entry;
  }

  getFeedback(type) {
    if (!type) {
      return [...this.records];
    }
    return this.records.filter((item) => item.type === type);
  }
}

module.exports = FeedbackService;
