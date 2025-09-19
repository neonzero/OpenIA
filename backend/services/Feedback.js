const Joi = require('joi');
const eventBus = require('../mq/eventBus');

const feedbackSchema = Joi.object({
  engagementId: Joi.string().required(),
  comment: Joi.string().allow('').default(''),
  rating: Joi.number().integer().min(1).max(5).required()
});

class FeedbackService {
  constructor({ auditRepository }) {
    this.auditRepository = auditRepository;
  }

  async submitFeedback(input) {
    const feedback = await feedbackSchema.validateAsync(input);
    // In real implementation we'd persist; here we just emit event.
    eventBus.publish('feedback_received', feedback);
    return feedback;
  }
}

module.exports = FeedbackService;
